import startUp from './pre-setup';
import * as cron from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import LoggingService from '@share/libs/logging/logging.service';
import ProductService from '../product.service';
import { product } from '@share/test/pre-setup/mock/data/product';
import messages from '@share/constants/messages';

let schedulerService: SchedulerRegistry;
let loggerService: LoggingService;
let productService: ProductService;
const actionName = 'action_name';

beforeEach(async () => {
  const moduleRef = await startUp();
  loggerService = moduleRef.get(LoggingService);
  schedulerService = moduleRef.get(SchedulerRegistry);
  productService = moduleRef.get(ProductService);
});

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

describe('delete product expired', () => {
  it('delete product expired success', () => {
    expect.hasAssertions();
    const log = jest.spyOn(loggerService, 'log');
    const addJob = jest.spyOn(schedulerService, 'addCronJob');
    const getCronJob = jest.spyOn(schedulerService, 'getCronJob');
    const doesExist = jest.spyOn(schedulerService, 'doesExist').mockReturnValue(false);
    (productService as any).deleteProductWhenExpired(product, actionName);
    expect(doesExist).toHaveBeenCalledTimes(1);
    expect(doesExist).toHaveBeenCalledWith('cron', expect.any(String));
    expect(addJob).toHaveBeenCalledTimes(1);
    expect(addJob).toHaveBeenCalledWith(expect.any(String), expect.any(CronJob));
    expect(globalThis.cronJob.start).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(expect.any(String), actionName);
    expect(getCronJob).not.toHaveBeenCalled();
  });

  it('delete product expired success when cronJob was exits', () => {
    expect.hasAssertions();
    const date = new Date(+product.expired_time);
    const mockCronJob = new cron.CronJob(date, () => {});
    const setTime = jest.spyOn(mockCronJob, 'setTime');
    const log = jest.spyOn(loggerService, 'log');
    const doesExist = jest.spyOn(schedulerService, 'doesExist').mockReturnValue(true);
    const addJob = jest.spyOn(schedulerService, 'addCronJob');
    const getCronJob = jest.spyOn(schedulerService, 'getCronJob').mockReturnValue(mockCronJob);
    (productService as any).deleteProductWhenExpired(product, actionName);
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

  it('delete product expired failed due date regis used past', () => {
    expect.hasAssertions();
    product.expired_time = Date.now() - 1000 * 60;
    const warn = jest.spyOn(loggerService, 'warn');
    const doesExist = jest.spyOn(schedulerService, 'doesExist');
    const addJob = jest.spyOn(schedulerService, 'addCronJob');
    const getCronJob = jest.spyOn(schedulerService, 'getCronJob');
    (productService as any).deleteProductWhenExpired(product, actionName);
    expect(doesExist).not.toHaveBeenCalled();
    expect(getCronJob).not.toHaveBeenCalled();
    expect(addJob).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(messages.PRODUCT.SCHEDULE_DELETE_PRODUCT_FAILED, actionName);
  });
});
