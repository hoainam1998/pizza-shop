import { SchedulerRegistry } from '@nestjs/schedule';
import * as cron from 'cron';
import SchedulerService, { jobStartMessage, jobUpdateMessage } from '../scheduler.service';
import startUp from './pre-setup';
import LoggingService from '@share/libs/logging/logging.service';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { formatDateTime } from '@share/utils';
import messages from '@share/constants/messages';

let loggerService: LoggingService;
let schedulerService: SchedulerService;
let schedulerRegistry: SchedulerRegistry;
const timeline = Date.now() + 10000;
const action = jest.fn();
const jobName = 'job_name';
const actionName = 'action_name';
const date = new Date(timeline);
const dateStr = formatDateTime(date);
const jobStartMessageStr = jobStartMessage(jobName, dateStr);
const jobUpdateMessageStr = jobUpdateMessage(jobName, dateStr);

beforeAll(async () => {
  const moduleRef = await startUp();
  loggerService = moduleRef.get(LoggingService);
  schedulerRegistry = moduleRef.get(SchedulerRegistry);
  schedulerService = moduleRef.get(SchedulerService);
});

describe('take action at specific time', () => {
  it('take action at specific time success', (done) => {
    expect.hasAssertions();
    const log = jest.spyOn(loggerService, 'log').mockImplementation(jest.fn);
    const getCronJob = jest.spyOn(schedulerRegistry, 'getCronJob');
    const addCronJob = jest.spyOn(schedulerRegistry, 'addCronJob').mockImplementation(jest.fn);
    const doesExist = jest.spyOn(schedulerRegistry, 'doesExist').mockReturnValue(false);
    const takeActionAtSpecificTime = jest.spyOn(schedulerService, 'takeActionAtSpecificTime');
    schedulerService.takeActionAtSpecificTime(timeline, action, jobName, actionName);
    expect(takeActionAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(doesExist).toHaveBeenCalledTimes(1);
    expect(doesExist).toHaveBeenCalledWith('cron', jobName);
    expect(addCronJob).toHaveBeenCalledTimes(1);
    expect(addCronJob).toHaveBeenCalledWith(jobName, expect.any(cron.CronJob));
    expect(globalThis.cronJob.start).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(jobStartMessageStr, actionName);
    expect(getCronJob).not.toHaveBeenCalled();
    done();
  });

  it('take action at specific time updated success', (done) => {
    expect.hasAssertions();
    const log = jest.spyOn(loggerService, 'log').mockImplementation(jest.fn);
    const getCronJob = jest.spyOn(schedulerRegistry, 'getCronJob').mockReturnValue(globalThis.cronJob);
    const addCronJob = jest.spyOn(schedulerRegistry, 'addCronJob').mockImplementation(jest.fn);
    const doesExist = jest.spyOn(schedulerRegistry, 'doesExist').mockReturnValue(true);
    const takeActionAtSpecificTime = jest.spyOn(schedulerService, 'takeActionAtSpecificTime');
    schedulerService.takeActionAtSpecificTime(timeline, action, jobName, actionName);
    expect(takeActionAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(doesExist).toHaveBeenCalledTimes(1);
    expect(doesExist).toHaveBeenCalledWith('cron', jobName);
    expect(getCronJob).toHaveBeenCalledTimes(1);
    expect(getCronJob).toHaveBeenLastCalledWith(jobName);
    expect(globalThis.cronJob.setTime).toHaveBeenCalledTimes(1);
    expect(globalThis.cronJob.setTime).toHaveBeenLastCalledWith(new cron.CronTime(date));
    expect(globalThis.cronJob.start).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(jobUpdateMessageStr, actionName);
    expect(addCronJob).not.toHaveBeenCalled();
    done();
  });

  it('take action at specific time failed due date regis used past ', (done) => {
    expect.hasAssertions();
    const usedTimeline = Date.now() - 10000;
    const warn = jest.spyOn(loggerService, 'warn').mockImplementation(jest.fn);
    const getCronJob = jest.spyOn(schedulerRegistry, 'getCronJob');
    const addCronJob = jest.spyOn(schedulerRegistry, 'addCronJob');
    const doesExist = jest.spyOn(schedulerRegistry, 'doesExist');
    const takeActionAtSpecificTime = jest.spyOn(schedulerService, 'takeActionAtSpecificTime');
    schedulerService.takeActionAtSpecificTime(usedTimeline, action, jobName, actionName);
    expect(takeActionAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(doesExist).not.toHaveBeenCalled();
    expect(getCronJob).not.toHaveBeenCalled();
    expect(globalThis.cronJob.setTime).not.toHaveBeenCalled();
    expect(globalThis.cronJob.start).not.toHaveBeenCalled();
    expect(addCronJob).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(messages.COMMON.EXECUTION_FAIL, actionName);
    done();
  });

  it('take action at specific time failed by got unknown error ', (done) => {
    expect.hasAssertions();
    const warn = jest.spyOn(loggerService, 'warn');
    const log = jest.spyOn(loggerService, 'log');
    const error = jest.spyOn(loggerService, 'error').mockImplementation(jest.fn);
    const getCronJob = jest.spyOn(schedulerRegistry, 'getCronJob');
    const addCronJob = jest.spyOn(schedulerRegistry, 'addCronJob');
    const doesExist = jest.spyOn(schedulerRegistry, 'doesExist').mockImplementation(() => {
      throw UnknownError;
    });
    const takeActionAtSpecificTime = jest.spyOn(schedulerService, 'takeActionAtSpecificTime');
    schedulerService.takeActionAtSpecificTime(timeline, action, jobName, actionName);
    expect(takeActionAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(doesExist).toHaveBeenCalledTimes(1);
    expect(doesExist).toHaveBeenCalledWith('cron', jobName);
    expect(getCronJob).not.toHaveBeenCalled();
    expect(addCronJob).not.toHaveBeenCalled();
    expect(globalThis.cronJob.setTime).not.toHaveBeenCalled();
    expect(globalThis.cronJob.start).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(UnknownError.message, actionName);
    done();
  });
});
