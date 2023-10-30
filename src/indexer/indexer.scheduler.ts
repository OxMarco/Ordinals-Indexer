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

    this.running = false;
  }

  @Cron(CronExpression.EVERY_SECOND)
  async handleCron() {
    if (this.running) return;

    const { run, latest } = await this.indexer.mustIndex();
    if (run) {
      await this.runIndexing(latest + 1);
    }
  }

  async runIndexing(block: number) {
    this.running = true;

    const res = await this.indexer.index(block);
    if (res == IndexerErrors.REORG) {
      await this.indexer.cleanup(block - 8, block);
      for (let i = block - 8; i <= block; i++) {
        await this.indexer.index(i);
      }
    }
    this.indexerService.latestBlock = block;

    this.running = false;
  }

  async onModuleDestroy() {
    await this.indexer.close();
  }
}
