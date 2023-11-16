import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LevelDBService } from 'src/leveldb/leveldb.service';
import { IndexerService } from './indexer.service';

@Injectable()
export class IndexerAnalyser implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IndexerAnalyser.name);
  private running;

  constructor(
    private readonly leveldbService: LevelDBService,
    private indexerService: IndexerService,
  ) {
    this.running = false;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    if (this.running) return;

    this.running = true;

    const tokens = await this.indexerService.getAll();
    for (const token of tokens) {
      try {
        const data = await this.leveldbService.get(
          'd_' + token.ticker + '_' + token.id,
        );
        const ddd = JSON.parse(data);
        const deployment = JSON.parse(ddd.value);
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

    this.running = false;
  }

  async onModuleInit() {
    this.logger.log('Analyser cronjob started');
  }

  async onModuleDestroy() {
    this.logger.log('Analyser cronjob stopped');
  }
}
