import startUp from './pre-setup';
import SchedulerService from '@share/libs/scheduler/scheduler.service';
import ProductService from '../product.service';
import { product } from '@share/test/pre-setup/mock/data/product';

let schedulerService: SchedulerService;
let productService: ProductService;
const actionName = 'action_name';

beforeEach(async () => {
  const moduleRef = await startUp();
  schedulerService = moduleRef.get(SchedulerService);
  productService = moduleRef.get(ProductService);
});

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

describe('update product state when expired', () => {
  it('update product state when expired success', () => {
    expect.hasAssertions();
    const updateStateExpired = jest.spyOn(schedulerService as any, 'updateStateExpired');
    (productService as any).updateProductStateWhenExpired(product, actionName);
    expect(updateStateExpired).toHaveBeenCalledTimes(1);
    expect(updateStateExpired).toHaveBeenCalledWith(
      +product.expired_time,
      expect.any(Function),
      (productService as any)._jobName,
      actionName,
    );
  });

  it('delete product expired success when cronJob was exits', () => {
    expect.hasAssertions();
    const updateStateExpired = jest.spyOn(schedulerService as any, 'updateStateExpired');
    (productService as any).updateProductStateWhenExpired(product, actionName);
    expect(updateStateExpired).toHaveBeenCalledTimes(1);
    expect(updateStateExpired).toHaveBeenCalledWith(
      +product.expired_time,
      expect.any(Function),
      (productService as any)._jobName,
      actionName,
    );
  });

  it('delete product expired failed due date regis used past', () => {
    expect.hasAssertions();
    product.expired_time = (Date.now() - 1000 * 10).toString();
    const updateStateExpired = jest.spyOn(schedulerService as any, 'updateStateExpired');
    (productService as any).updateProductStateWhenExpired(product, actionName);
    expect(updateStateExpired).toHaveBeenCalledTimes(1);
    expect(updateStateExpired).toHaveBeenCalledWith(
      +product.expired_time,
      expect.any(Function),
      (productService as any)._jobName,
      actionName,
    );
  });
});
