import { Processor, Process } from '@nestjs/bull';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { LevelDBService } from 'src/leveldb/leveldb.service';
import { IndexerService } from './indexer.service';
import { Indexer, IndexerErrors } from 'src/utils/indexer';

@Processor('indexer')
export class IndexerConsumer implements OnModuleDestroy, OnModuleDestroy {
  private readonly logger = new Logger(IndexerConsumer.name);
  private indexer;

  constructor(
    private readonly leveldbService: LevelDBService,
    private indexerService: IndexerService,
    private configService: ConfigService,
  ) {
    this.indexer = new Indexer(
      this.configService.get<string>('BITCOIN_NODE_URL') || '',
      leveldbService,
      indexerService,
    );
  }

  @Process('analyse')
  async analyse(job: Job<unknown>) {
    const tokens = await this.indexerService.getAll();
    for (const token of tokens) {
      try {
        const data = await this.leveldbService.get(
          'd_' + token.ticker + '_' + token.id,
        );
        const d = JSON.parse(data);
        const deployment = JSON.parse(d.value);
        if (deployment.rem !== token.remaining) {
          this.logger.warn(
            'Mismatch on remaining amount for token ' +
              token.ticker +
              ':' +
              token.id,
          );
          await this.indexerService.updateRemaining(
            token.ticker,
            token.id,
            deployment.rem,
          );
        }
      } catch (e) {
        this.logger.error(
          'Token ' + token.ticker + ':' + token.id + ' not found on leveldb',
        );
      }
    }
  }

  @Process('index')
  async index(job: Job<unknown>) {
    if (await this.indexer.mustIndex()) {
      const res = await this.indexer.index();

      if (res == IndexerErrors.REORG) {
        await this.indexer.cleanup();
      } else if (res == IndexerErrors.BLOCK_AREADY_ANALYSED) {
        await this.indexer.syncBlock();
      }
    }
  }

  async onModuleInit() {
    await this.indexer.init();
    this.logger.log('Queue processor started');
  }

  async onModuleDestroy() {
    await this.indexer.close();
    this.logger.log('Queue processor stopped');
  }
}
