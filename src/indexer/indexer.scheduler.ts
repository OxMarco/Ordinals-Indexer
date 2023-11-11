import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Indexer, IndexerErrors } from 'src/utils/indexer';
import { LevelDBService } from 'src/leveldb/leveldb.service';
import { IndexerService } from './indexer.service';

@Injectable()
export class IndexScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IndexScheduler.name);
  private indexer;
  private running;

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

    this.logger.log('Cronjob started');
    this.running = false;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    if (this.running) return;

    if (await this.indexer.mustIndex()) {
      await this.runIndexing();
    }
  }

  async runIndexing() {
    this.running = true;

    this.logger.log(`Indexing block ${this.indexer.block}`);

    const res = await this.indexer.index();
    if (res == IndexerErrors.REORG) {
      await this.indexer.cleanup();
    } else if (res == IndexerErrors.BLOCK_AREADY_ANALYSED) {
      this.indexer.block += 1;
    }

    this.logger.log(`Finished indexing block ${this.indexer.block}`);

    this.running = false;
  }

  async onModuleInit() {
    await this.indexer.init();
    this.logger.log('Cronjob started');
  }

  async onModuleDestroy() {
    await this.indexer.close();
    this.logger.log('Cronjob stopped');
  }
}
