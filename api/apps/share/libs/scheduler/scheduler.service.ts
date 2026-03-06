import { Injectable } from '@nestjs/common';
import * as cron from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { formatDateTime } from '@share/utils';
import messages from '@share/constants/messages';
import LoggingService from '../logging/logging.service';

export const jobStartMessage = (jobName: string, dateStr: string) => `job "${jobName}" added at ${dateStr}!`;
export const jobUpdateMessage = (jobName: string, dateStr: string) => `job "${jobName}" updated at ${dateStr}!`;

@Injectable()
export default class SchedulerService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly logger: LoggingService,
  ) {}

  updateStateExpired(expiredTime: number, action: () => Promise<any>, jobName: string, actionName: string): void {
    try {
      if (expiredTime > Date.now()) {
        const date = new Date(expiredTime);
        const dateStr = formatDateTime(date);
        if (this.schedulerRegistry.doesExist('cron', jobName)) {
          const cronJob = this.schedulerRegistry.getCronJob(jobName);
          cronJob.setTime(new cron.CronTime(date));
          cronJob.start();
          this.logger.log(jobUpdateMessage(jobName, dateStr), actionName);
        } else {
          const job = new cron.CronJob(date, async () => {
            await action();
            this.logger.log(messages.PRODUCT.PRODUCT_STATE_UPDATED, actionName);
          });
          this.schedulerRegistry.addCronJob(jobName, job);
          job.start();
          this.logger.log(jobStartMessage(jobName, dateStr), actionName);
        }
      }
      this.logger.warn(messages.PRODUCT.SCHEDULE_UPDATE_STATE_PRODUCT_FAILED, actionName);
    } catch (error) {
      this.logger.error(error.message as string, actionName);
    }
  }

  deleteScheduler(jobName: string, actionName: string): void {
    try {
      this.schedulerRegistry.deleteCronJob(jobName);
      this.logger.log(`${jobName} was cancel!`, actionName);
    } catch (error) {
      this.logger.error(error.message as string, actionName);
    }
  }

  takeActionAtSpecificTime(timeline: number, action: () => Promise<any>, jobName: string, actionName: string): void {
    try {
      if (timeline > Date.now()) {
        const date = new Date(timeline);
        const dateStr = formatDateTime(date);
        if (this.schedulerRegistry.doesExist('cron', jobName)) {
          const cronJob = this.schedulerRegistry.getCronJob(jobName);
          cronJob.setTime(new cron.CronTime(date));
          cronJob.start();
          this.logger.log(jobUpdateMessage(jobName, dateStr), actionName);
        } else {
          const job = new cron.CronJob(date, async () => {
            await action();
            this.logger.log(messages.COMMON.EXECUTION_SUCCESS, actionName);
          });
          this.schedulerRegistry.addCronJob(jobName, job);
          job.start();
          this.logger.log(jobStartMessage(jobName, dateStr), actionName);
        }
      } else {
        this.logger.warn(messages.COMMON.EXECUTION_FAIL, actionName);
      }
    } catch (error) {
      this.logger.error(error.message as string, actionName);
    }
  }
}
