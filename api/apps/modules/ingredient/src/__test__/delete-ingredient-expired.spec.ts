import { SchedulerRegistry } from '@nestjs/schedule';
import * as cron from 'cron';
import IngredientService from '../ingredient.service';
import LoggingService from '@share/libs/logging/logging.service';
import SchedulerService from '@share/libs/scheduler/scheduler.service';
import startUp from './pre-setup';
import { ingredient } from '@share/test/pre-setup/mock/data/ingredient';
import messages from '@share/constants/messages';

let schedulerRegistry: SchedulerRegistry;
let ingredientService: IngredientService;
let schedulerService: SchedulerService;
let loggerService: LoggingService;
const actionName = 'action_name';

beforeEach(async () => {
  const moduleRef = await startUp();

  ingredientService = moduleRef.get(IngredientService);
  loggerService = moduleRef.get(LoggingService);
  schedulerService = moduleRef.get(SchedulerService);
  schedulerRegistry = moduleRef.get(SchedulerRegistry);
});

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

describe('delete-ingredient-expired', () => {
  it('delete ingredient expired success', () => {
    expect.hasAssertions();
    const log = jest.spyOn(loggerService, 'log');
    const addJob = jest.spyOn(schedulerRegistry, 'addCronJob');
    const getCronJob = jest.spyOn(schedulerRegistry, 'getCronJob');
    const doesExist = jest.spyOn(schedulerRegistry, 'doesExist').mockReturnValue(false);
    const deleteItemExpired = jest.spyOn(schedulerService as any, 'deleteItemExpired');
    (ingredientService as any).deleteIngredientExpired(ingredient, actionName);
    expect(deleteItemExpired).toHaveBeenCalledTimes(1);
    expect(deleteItemExpired).toHaveBeenCalledWith(
      +ingredient.expired_time,
      expect.any(Function),
      expect.any(String),
      actionName,
    );
    expect(doesExist).toHaveBeenCalledTimes(1);
    expect(doesExist).toHaveBeenCalledWith('cron', expect.any(String));
    expect(addJob).toHaveBeenCalledTimes(1);
    expect(addJob).toHaveBeenCalledWith(expect.any(String), expect.any(cron.CronJob));
    expect(globalThis.cronJob.start).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(expect.any(String), actionName);
    expect(getCronJob).not.toHaveBeenCalled();
  });

  it('delete ingredient expired success when cronJob was exits', () => {
    expect.hasAssertions();
    const date = new Date(+ingredient.expired_time);
    const mockCronJob = new cron.CronJob(date, () => {});
    const setTime = jest.spyOn(mockCronJob, 'setTime');
    const log = jest.spyOn(loggerService, 'log');
    const doesExist = jest.spyOn(schedulerRegistry, 'doesExist').mockReturnValue(true);
    const addJob = jest.spyOn(schedulerRegistry, 'addCronJob');
    const getCronJob = jest.spyOn(schedulerRegistry, 'getCronJob').mockReturnValue(mockCronJob);
    const deleteItemExpired = jest.spyOn(schedulerService as any, 'deleteItemExpired');
    (ingredientService as any).deleteIngredientExpired(ingredient, actionName);
    expect(deleteItemExpired).toHaveBeenCalledTimes(1);
    expect(deleteItemExpired).toHaveBeenCalledWith(
      +ingredient.expired_time,
      expect.any(Function),
      expect.any(String),
      actionName,
    );
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

  it('delete ingredient expired failed due date regis used past', () => {
    expect.hasAssertions();
    ingredient.expired_time = (Date.now() - 1000 * 10).toString();
    const date = new Date(+ingredient.expired_time);
    const mockCronJob = new cron.CronJob(date, () => {});
    const warn = jest.spyOn(loggerService, 'warn');
    const doesExist = jest.spyOn(schedulerRegistry, 'doesExist').mockReturnValue(true);
    const addJob = jest.spyOn(schedulerRegistry, 'addCronJob');
    const getCronJob = jest.spyOn(schedulerRegistry, 'getCronJob').mockReturnValue(mockCronJob);
    const deleteItemExpired = jest.spyOn(schedulerService as any, 'deleteItemExpired');
    (ingredientService as any).deleteIngredientExpired(ingredient, actionName);
    expect(deleteItemExpired).toHaveBeenCalledTimes(1);
    expect(deleteItemExpired).toHaveBeenCalledWith(
      +ingredient.expired_time,
      expect.any(Function),
      expect.any(String),
      actionName,
    );
    expect(doesExist).not.toHaveBeenCalled();
    expect(getCronJob).not.toHaveBeenCalled();
    expect(addJob).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(messages.PRODUCT.SCHEDULE_DELETE_PRODUCT_FAILED, actionName);
  });
});
