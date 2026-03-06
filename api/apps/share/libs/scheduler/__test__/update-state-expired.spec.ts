import * as cron from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import SchedulerService, { jobStartMessage, jobUpdateMessage } from '../scheduler.service';
import startUp from './pre-setup';
import LoggingService from '@share/libs/logging/logging.service';
import { formatDateTime } from '@share/utils';
import messages from '@share/constants/messages';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let loggerService: LoggingService;
let schedulerService: SchedulerService;
let schedulerRegistry: SchedulerRegistry;
const expiredTime = Date.now() + 10 * 1000;
const jobName = 'job_name';
const actionName = 'action_name';
const action = jest.fn();
const date = new Date(expiredTime);
const dateStr = formatDateTime(date);
const jobStartMessageStr = jobStartMessage(jobName, dateStr);
const jobUpdateMessageStr = jobUpdateMessage(jobName, dateStr);

beforeAll(async () => {
  const moduleRef = await startUp();
  loggerService = moduleRef.get(LoggingService);
  schedulerRegistry = moduleRef.get(SchedulerRegistry);
  schedulerService = moduleRef.get(SchedulerService);
});

describe('update state expired', () => {
  it('update state expired success', (done) => {
    expect.hasAssertions();
    const log = jest.spyOn(loggerService, 'log').mockImplementation(jest.fn);
    const addJob = jest.spyOn(schedulerRegistry, 'addCronJob');
    const getCronJob = jest.spyOn(schedulerRegistry, 'getCronJob');
    const doesExist = jest.spyOn(schedulerRegistry, 'doesExist').mockReturnValue(false);
    schedulerService.updateStateExpired(expiredTime, action, jobName, actionName);
    expect(doesExist).toHaveBeenCalledTimes(1);
    expect(doesExist).toHaveBeenCalledWith('cron', expect.any(String));
    expect(addJob).toHaveBeenCalledTimes(1);
    expect(addJob).toHaveBeenCalledWith(jobName, expect.any(cron.CronJob));
    expect(globalThis.cronJob.start).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(jobStartMessageStr, actionName);
    expect(getCronJob).not.toHaveBeenCalled();
    done();
  });

  it('update state expired success when cronJob was exits', (done) => {
    expect.hasAssertions();
    const date = new Date(expiredTime);
    const mockCronJob = new cron.CronJob(date, () => {});
    const setTime = jest.spyOn(mockCronJob, 'setTime');
    const log = jest.spyOn(loggerService, 'log').mockImplementation(jest.fn);
    const doesExist = jest.spyOn(schedulerRegistry, 'doesExist').mockReturnValue(true);
    const addJob = jest.spyOn(schedulerRegistry, 'addCronJob');
    const getCronJob = jest.spyOn(schedulerRegistry, 'getCronJob').mockReturnValue(mockCronJob);
    schedulerService.updateStateExpired(expiredTime, action, jobName, actionName);
    expect(doesExist).toHaveBeenCalledTimes(1);
    expect(doesExist).toHaveBeenCalledWith('cron', jobName);
    expect(getCronJob).toHaveBeenCalledTimes(1);
    expect(getCronJob).toHaveBeenCalledWith(jobName);
    expect(setTime).toHaveBeenCalledTimes(1);
    expect(setTime).toHaveBeenCalledWith(new cron.CronTime(date));
    expect(addJob).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(jobUpdateMessageStr, actionName);
    done();
  });

  it('update state expired failed due date regis used past', (done) => {
    expect.hasAssertions();
    const expiredTimePassed = Date.now() - 1000 * 60;
    const warn = jest.spyOn(loggerService, 'warn');
    const doesExist = jest.spyOn(schedulerRegistry, 'doesExist');
    const addJob = jest.spyOn(schedulerRegistry, 'addCronJob');
    const getCronJob = jest.spyOn(schedulerRegistry, 'getCronJob');
    schedulerService.updateStateExpired(expiredTimePassed, action, jobName, actionName);
    expect(doesExist).not.toHaveBeenCalled();
    expect(getCronJob).not.toHaveBeenCalled();
    expect(addJob).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(messages.PRODUCT.SCHEDULE_UPDATE_STATE_PRODUCT_FAILED, actionName);
    done();
  });

  it('update state expired failed with unknown error', (done) => {
    expect.hasAssertions();
    const warn = jest.spyOn(loggerService, 'warn');
    const log = jest.spyOn(loggerService, 'log');
    const logError = jest.spyOn(loggerService, 'error');
    const doesExist = jest.spyOn(schedulerRegistry, 'doesExist').mockImplementation(() => {
      throw UnknownError;
    });
    const addJob = jest.spyOn(schedulerRegistry, 'addCronJob');
    const getCronJob = jest.spyOn(schedulerRegistry, 'getCronJob');
    schedulerService.updateStateExpired(expiredTime, action, jobName, actionName);
    expect(doesExist).toHaveBeenCalledTimes(1);
    expect(doesExist).toHaveBeenCalledWith('cron', jobName);
    expect(getCronJob).not.toHaveBeenCalled();
    expect(addJob).not.toHaveBeenCalled();
    expect(globalThis.cronJob.setTime).not.toHaveBeenCalled();
    expect(globalThis.cronJob.start).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(UnknownError.message, actionName);
    done();
  });
});
