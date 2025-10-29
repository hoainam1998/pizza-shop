import { SchedulerRegistry } from '@nestjs/schedule';
import SchedulerService from '../scheduler.service';
import startUp from './pre-setup';
import LoggingService from '@share/libs/logging/logging.service';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let loggerService: LoggingService;
let schedulerService: SchedulerService;
let schedulerRegistry: SchedulerRegistry;
const jobName = 'job_name';
const actionName = 'action_name';

beforeEach(async () => {
  const moduleRef = await startUp();
  loggerService = moduleRef.get(LoggingService);
  schedulerRegistry = moduleRef.get(SchedulerRegistry);
  schedulerService = moduleRef.get(SchedulerService);
});

describe('delete scheduler', () => {
  it('delete scheduler success', () => {
    expect.hasAssertions();
    const log = jest.spyOn(loggerService, 'log');
    const deleteCronJob = jest.spyOn(schedulerRegistry, 'deleteCronJob').mockImplementation(() => jest.fn());
    schedulerService.deleteScheduler(jobName, actionName);
    expect(deleteCronJob).toHaveBeenCalledTimes(1);
    expect(deleteCronJob).toHaveBeenCalledWith(jobName);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(`${jobName} was cancel!`, actionName);
  });

  it('delete scheduler failed', () => {
    expect.hasAssertions();
    const logError = jest.spyOn(loggerService, 'error');
    const deleteCronJob = jest.spyOn(schedulerRegistry, 'deleteCronJob').mockImplementation(() => {
      throw UnknownError;
    });
    schedulerService.deleteScheduler(jobName, actionName);
    expect(deleteCronJob).toHaveBeenCalledTimes(1);
    expect(deleteCronJob).toHaveBeenCalledWith(jobName);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(UnknownError.message, actionName);
  });
});
