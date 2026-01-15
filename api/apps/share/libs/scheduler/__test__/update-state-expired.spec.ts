import * as cron from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import SchedulerService from '../scheduler.service';
import startUp from './pre-setup';
import LoggingService from '@share/libs/logging/logging.service';
import messages from '@share/constants/messages';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let loggerService: LoggingService;
let schedulerService: SchedulerService;
let schedulerRegistry: SchedulerRegistry;
const expiredTime = Date.now() + 10 * 1000;
const jobName = 'job_name';
const actionName = 'action_name';
const action = jest.fn();

beforeEach(async () => {
  const moduleRef = await startUp();
  loggerService = moduleRef.get(LoggingService);
  schedulerRegistry = moduleRef.get(SchedulerRegistry);
  schedulerService = moduleRef.get(SchedulerService);
});

describe('delete item expired', () => {
  it('delete item expired success', () => {
    expect.hasAssertions();
    const log = jest.spyOn(loggerService, 'log');
    const addJob = jest.spyOn(schedulerRegistry, 'addCronJob');
    const getCronJob = jest.spyOn(schedulerRegistry, 'getCronJob');
    const doesExist = jest.spyOn(schedulerRegistry, 'doesExist').mockReturnValue(false);
    schedulerService.updateStateExpired(expiredTime, action, jobName, actionName);
    expect(doesExist).toHaveBeenCalledTimes(1);
    expect(doesExist).toHaveBeenCalledWith('cron', expect.any(String));
    expect(addJob).toHaveBeenCalledTimes(1);
    expect(addJob).toHaveBeenCalledWith(expect.any(String), expect.any(cron.CronJob));
    expect(globalThis.cronJob.start).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(expect.any(String), actionName);
    expect(getCronJob).not.toHaveBeenCalled();
  });

  it('delete item expired success when cronJob was exits', () => {
    expect.hasAssertions();
    const date = new Date(expiredTime);
    const mockCronJob = new cron.CronJob(date, () => {});
    const setTime = jest.spyOn(mockCronJob, 'setTime');
    const log = jest.spyOn(loggerService, 'log');
    const doesExist = jest.spyOn(schedulerRegistry, 'doesExist').mockReturnValue(true);
    const addJob = jest.spyOn(schedulerRegistry, 'addCronJob');
    const getCronJob = jest.spyOn(schedulerRegistry, 'getCronJob').mockReturnValue(mockCronJob);
    schedulerService.updateStateExpired(expiredTime, action, jobName, actionName);
    expect(doesExist).toHaveBeenCalledTimes(1);
    expect(doesExist).toHaveBeenCalledWith('cron', expect.any(String));
    expect(getCronJob).toHaveBeenCalledTimes(1);
    expect(getCronJob).toHaveBeenCalledWith(expect.any(String));
    expect(setTime).toHaveBeenCalledTimes(1);
    expect(setTime).toHaveBeenCalledWith(new cron.CronTime(date));
    expect(addJob).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(expect.any(String), actionName);
  });

  it('delete item expired failed due date regis used past', () => {
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
  });

  it('delete item expired failed with unknown error', () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error');
    const doesExist = jest.spyOn(schedulerRegistry, 'doesExist').mockImplementation(() => {
      throw UnknownError;
    });
    const addJob = jest.spyOn(schedulerRegistry, 'addCronJob');
    const getCronJob = jest.spyOn(schedulerRegistry, 'getCronJob');
    schedulerService.updateStateExpired(expiredTime, action, jobName, actionName);
    expect(doesExist).toHaveBeenCalled();
    expect(doesExist).toHaveBeenCalledWith('cron', expect.any(String));
    expect(getCronJob).not.toHaveBeenCalled();
    expect(addJob).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(UnknownError.message, actionName);
  });
});
