import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Indexer, IndexerErrors } from 'src/utils/indexer';
import { TokenService } from './token.service';
import { UtxoService } from 'src/utxo/utxo.service';

@Injectable()
export class IndexScheduler implements OnModuleDestroy {
  private readonly logger = new Logger(IndexScheduler.name);
  private indexer;
  private running;

  constructor(
    private configService: ConfigService,
    private tokenService: TokenService,
    private utxoService: UtxoService,
  ) {
    this.indexer = new Indexer(
      this.configService.get<string>('BITCOIN_NODE_URL') || '',
      tokenService,
      utxoService,
    );

    this.logger.log('Cronjob started');
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
    }

    this.running = false;
  }

  async onModuleDestroy() {
    await this.indexer.close();
    this.logger.log('Cronjob stopped');
  }
}
