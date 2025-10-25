import { Injectable } from '@nestjs/common';
import * as cron from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { formatDateTime } from '@share/utils';
import messages from '@share/constants/messages';
import LoggingService from '../logging/logging.service';

@Injectable()
export default class SchedulerService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly logger: LoggingService,
  ) {}

  deleteItemExpired(expiredTime: number, action: () => Promise<any>, jobName: string, actionName: string): void {
    if (expiredTime > Date.now()) {
      const date = new Date(expiredTime);
      const dateStr = formatDateTime(date);
      if (this.schedulerRegistry.doesExist('cron', jobName)) {
        const cronJob = this.schedulerRegistry.getCronJob(jobName);
        cronJob.setTime(new cron.CronTime(date));
      } else {
        const job = new cron.CronJob(date, async () => {
          await action();
          this.logger.log(messages.PRODUCT.PRODUCT_DELETED, actionName);
        });
        this.schedulerRegistry.addCronJob(jobName, job);
        job.start();
      }
      this.logger.log(`job "${jobName}" added at ${dateStr}!`, actionName);
    }
    this.logger.warn(messages.PRODUCT.SCHEDULE_DELETE_PRODUCT_FAILED, actionName);
  }
}
