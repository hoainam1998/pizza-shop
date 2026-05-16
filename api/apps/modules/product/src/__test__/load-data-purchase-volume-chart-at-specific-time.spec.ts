import { ClientProxy } from '@nestjs/microservices';
import startUp from './pre-setup';
import ProductService from '../product.service';
import { SOCKET_SERVICE } from '@share/di-token';
import { createBills } from '@share/test/pre-setup/mock/data/bill';
import { addDataChartEventPattern } from '@share/pattern';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { PrismaDisconnectError } from '@share/test/pre-setup/mock/errors/prisma-errors';

let productService: ProductService;
let socketGateway: ClientProxy;
const bills = createBills(2);
const payload = bills.reduce(
  (data, bill) => {
    data.revenue += bill.complete_total - bill.capital;
    data.capital += bill.capital;
    return data;
  },
  { revenue: 0, capital: 0 },
);

beforeAll(async () => {
  const moduleRef = await startUp();
  productService = moduleRef.get(ProductService);
  socketGateway = moduleRef.get(SOCKET_SERVICE);
});

describe('load data purchase volume chart at specific time', () => {
  it('load data purchase volume chart at specific time success', async () => {
    expect.hasAssertions();
    const timeline = new Date();
    timeline.setHours(8, 0, 0, 0);
    const timelineToTimestamp = timeline.getTime();
    const loadDataPurchaseVolumeChartAtSpecificTime = jest.spyOn(
      productService as any,
      'loadDataPurchaseVolumeChartAtSpecificTime',
    );
    const getBillsAtSpecificTime = jest
      .spyOn(productService as any, 'getBillsAtSpecificTime')
      .mockResolvedValueOnce(bills);
    const emit = jest.spyOn(socketGateway, 'emit').mockImplementation(jest.fn());
    const executeActionAtTimeline = jest
      .spyOn(productService as any, 'executeActionAtTimeline')
      .mockImplementation(jest.fn);
    (productService as any).loadDataPurchaseVolumeChartAtSpecificTime(timelineToTimestamp);
    expect(loadDataPurchaseVolumeChartAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
    await getBillsAtSpecificTime.mock.results[0].value;
    await getBillsAtSpecificTime.mock.results[0].value;
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(addDataChartEventPattern, payload);
    expect(executeActionAtTimeline).toHaveBeenCalledTimes(1);
    expect(executeActionAtTimeline).toHaveBeenLastCalledWith(expect.any(Number));
  });

  it('load data purchase volume chart at specific time failed when getBillsAtSpecificTime got unknown error', async () => {
    expect.hasAssertions();
    const timeline = new Date();
    timeline.setHours(8, 0, 0, 0);
    const timelineToTimestamp = timeline.getTime();
    const loadDataPurchaseVolumeChartAtSpecificTime = jest.spyOn(
      productService as any,
      'loadDataPurchaseVolumeChartAtSpecificTime',
    );
    const getBillsAtSpecificTime = jest
      .spyOn(productService as any, 'getBillsAtSpecificTime')
      .mockRejectedValue(UnknownError);
    const emit = jest.spyOn(socketGateway, 'emit').mockImplementation(jest.fn());
    const executeActionAtTimeline = jest
      .spyOn(productService as any, 'executeActionAtTimeline')
      .mockImplementation(jest.fn);
    await expect(
      (productService as any).loadDataPurchaseVolumeChartAtSpecificTime(timelineToTimestamp),
    ).rejects.toThrow(UnknownError);
    expect(loadDataPurchaseVolumeChartAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
    expect(emit).not.toHaveBeenCalled();
    expect(executeActionAtTimeline).not.toHaveBeenCalled();
  });

  it('load data purchase volume chart at specific time failed when getBillsAtSpecificTime got database disconnect error', async () => {
    expect.hasAssertions();
    const timeline = new Date();
    timeline.setHours(8, 0, 0, 0);
    const timelineToTimestamp = timeline.getTime();
    const loadDataPurchaseVolumeChartAtSpecificTime = jest.spyOn(
      productService as any,
      'loadDataPurchaseVolumeChartAtSpecificTime',
    );
    const getBillsAtSpecificTime = jest
      .spyOn(productService as any, 'getBillsAtSpecificTime')
      .mockRejectedValue(PrismaDisconnectError);
    const emit = jest.spyOn(socketGateway, 'emit').mockImplementation(jest.fn());
    const executeActionAtTimeline = jest
      .spyOn(productService as any, 'executeActionAtTimeline')
      .mockImplementation(jest.fn);
    await expect(
      (productService as any).loadDataPurchaseVolumeChartAtSpecificTime(timelineToTimestamp),
    ).rejects.toThrow(PrismaDisconnectError);
    expect(loadDataPurchaseVolumeChartAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
    expect(emit).not.toHaveBeenCalled();
    expect(executeActionAtTimeline).not.toHaveBeenCalled();
  });

  it('load data purchase volume chart at specific time failed with executeActionAtTimeline got unknown error', async () => {
    expect.hasAssertions();
    const timeline = new Date();
    timeline.setHours(8, 0, 0, 0);
    const timelineToTimestamp = timeline.getTime();
    const loadDataPurchaseVolumeChartAtSpecificTime = jest.spyOn(
      productService as any,
      'loadDataPurchaseVolumeChartAtSpecificTime',
    );
    const getBillsAtSpecificTime = jest
      .spyOn(productService as any, 'getBillsAtSpecificTime')
      .mockResolvedValueOnce(bills);
    const emit = jest.spyOn(socketGateway, 'emit').mockImplementation(jest.fn());
    const executeActionAtTimeline = jest
      .spyOn(productService as any, 'executeActionAtTimeline')
      .mockImplementation(() => {
        throw UnknownError;
      });
    await expect(
      (productService as any).loadDataPurchaseVolumeChartAtSpecificTime(timelineToTimestamp),
    ).rejects.toThrow(UnknownError);
    expect(loadDataPurchaseVolumeChartAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledTimes(1);
    expect(getBillsAtSpecificTime).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
    await getBillsAtSpecificTime.mock.results[0].value;
    await getBillsAtSpecificTime.mock.results[0].value;
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(addDataChartEventPattern, payload);
    expect(executeActionAtTimeline).toHaveBeenCalledTimes(1);
    expect(executeActionAtTimeline).toHaveBeenLastCalledWith(expect.any(Number));
  });
});
