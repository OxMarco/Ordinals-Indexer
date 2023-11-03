import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Indexer, IndexerErrors } from 'src/utils/indexer';
import { IndexerService } from './indexer.service';

@Injectable()
export class IndexScheduler implements OnModuleDestroy {
  private readonly logger = new Logger(IndexScheduler.name);
  private indexer;
  private running;

  constructor(
    private configService: ConfigService,
    private indexerService: IndexerService,
  ) {
    this.indexer = new Indexer(
      this.configService.get<string>('BITCOIN_NODE_URL') || '',
      indexerService,
    );

    this.logger.log('Starting the cronjob');
    this.running = false;
  }

  @Cron(CronExpression.EVERY_SECOND)
  async handleCron() {
    if (this.running) return;

    const { run, latest } = await this.indexer.mustIndex();
    this.indexerService.latestBlock = latest + 1;
    if (run) {
      await this.runIndexing(latest + 1);
    }
  }

  async runIndexing(block: number) {
    this.running = true;

    const res = await this.indexer.index(block);
    if (res == IndexerErrors.REORG) {
      await this.indexer.cleanup(block - 8, block);
      this.indexerService.latestBlock = block - 8;
    }

    this.running = false;
  }

  async onModuleDestroy() {
    this.logger.log('Cronjob stopped');
    await this.indexer.close();
  }
}
