import startUp from './pre-setup';
import ProductService from '../product.service';
import SchedulerService from '@share/libs/scheduler/scheduler.service';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let schedulerService: SchedulerService;
let productService: ProductService;
const timeline = Date.now();

beforeAll(async () => {
  const moduleRef = await startUp();
  schedulerService = moduleRef.get(SchedulerService);
  productService = moduleRef.get(ProductService);
});

describe('execute action at timeline', () => {
  it('execute action at timeline success', () => {
    expect.hasAssertions();
    const takeActionAtSpecificTime = jest
      .spyOn(schedulerService, 'takeActionAtSpecificTime')
      .mockImplementation(jest.fn());
    const executeActionAtTimeline = jest.spyOn(productService as any, 'executeActionAtTimeline');
    (productService as any).executeActionAtTimeline(timeline);
    expect(executeActionAtTimeline).toHaveBeenCalledTimes(1);
    expect(takeActionAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(takeActionAtSpecificTime).toHaveBeenCalledWith(
      timeline,
      expect.any(Function),
      expect.any(String),
      expect.any(String),
    );
  });

  it('execute action at timeline failed with unknown error', () => {
    expect.hasAssertions();
    const takeActionAtSpecificTime = jest.spyOn(schedulerService, 'takeActionAtSpecificTime').mockImplementation(() => {
      throw UnknownError;
    });
    const executeActionAtTimeline = jest.spyOn(productService as any, 'executeActionAtTimeline');
    expect(() => (productService as any).executeActionAtTimeline(timeline)).toThrow(UnknownError);
    expect(executeActionAtTimeline).toHaveBeenCalledTimes(1);
    expect(takeActionAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(takeActionAtSpecificTime).toHaveBeenCalledWith(
      timeline,
      expect.any(Function),
      expect.any(String),
      expect.any(String),
    );
  });
});
