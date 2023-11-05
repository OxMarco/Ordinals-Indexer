import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Indexer, IndexerErrors } from 'src/utils/indexer';
import { TokenService } from './token.service';
import { UtxoService } from 'src/utxo/utxo.service';

@Injectable()
export class IndexScheduler implements OnModuleInit, OnModuleDestroy {
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

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    if (this.running) return;

    if (await this.indexer.mustIndex()) await this.runIndexing();
  }

  async runIndexing() {
    this.running = true;

    const res = await this.indexer.index();
    if (res == IndexerErrors.REORG) {
      await this.indexer.cleanup();
    } else if (res == IndexerErrors.BLOCK_AREADY_ANALYSED) {
      this.indexer.block++;
    }

    this.running = false;
  }

  async onModuleInit() {
    await this.indexer.init();
  }

  async onModuleDestroy() {
    this.logger.log('Cronjob stopping...');
    await this.indexer.close();
    this.logger.log('Cronjob stopped');
  }
}
