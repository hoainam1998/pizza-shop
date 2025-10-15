import startUp from './pre-setup';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import LoggingService from '@share/libs/logging/logging.service';
import ProductService from '../product.service';
import { product } from '@share/test/pre-setup/mock/data/product';

let schedulerService: SchedulerRegistry;
let loggerService: LoggingService;
let productService: ProductService;

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
    const actionName = 'action_name';
    const log = jest.spyOn(loggerService, 'log');
    const addJob = jest.spyOn(schedulerService, 'addCronJob');
    (productService as any).deleteProductWhenExpired(product, actionName);
    expect(addJob).toHaveBeenCalledTimes(1);
    expect(addJob).toHaveBeenCalledWith(expect.any(String), expect.any(CronJob));
    expect(globalThis.cronJob.start).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(expect.any(String), actionName);
  });
});
