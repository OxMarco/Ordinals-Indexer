import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class IndexScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IndexScheduler.name);

  constructor(@InjectQueue('indexer') private indexerQueue: Queue) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleIndexer() {
    const job = await this.indexerQueue.getJob('indexJob');
    if (!job) {
      await this.indexerQueue.add('index', null, {
        jobId: 'indexJob',
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: true,
      });
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleAnalyser() {
    const job = await this.indexerQueue.getJob('analyseJob');
    if (!job) {
      await this.indexerQueue.add('analyse', null, {
        jobId: 'analyseJob',
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: true,
      });
    }
  }

  async onModuleInit() {
    this.logger.log('Scheduler cronjob started');
  }

  async onModuleDestroy() {
    this.logger.log('Scheduler cronjob stopped');
  }
}
