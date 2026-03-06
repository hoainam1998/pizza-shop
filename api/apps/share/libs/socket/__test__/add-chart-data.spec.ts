import EventsGateway from '../event-socket.gateway';
import startUp from './pre-setup';
import SocketInstances from '../socket-instances/socket-instances';
import socketEventNames from '@share/constants/socket-event-names';
import ReportCachingService from '@share/libs/caching/report/report.service';
import type { DataChartAddedType } from '@share/interfaces';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import LoggingService from '@share/libs/logging/logging.service';
import './socket-instances-storage-mock';

let gateway: EventsGateway;
let loggerService: LoggingService;
let reportCachingService: ReportCachingService;
const userIds = [Date.now().toString()];
const payload: DataChartAddedType = {
  revenue: 0,
  capital: 0,
};
const emitParameters = userIds.map(() => [socketEventNames.ADD_DATA_CHART, payload]);

const socket: any = {
  emit: jest.fn(),
};

beforeAll(async () => {
  const moduleRef = await startUp();
  gateway = moduleRef.get(EventsGateway);
  loggerService = moduleRef.get(LoggingService);
  reportCachingService = moduleRef.get(ReportCachingService);
});

describe('add chart data', () => {
  it('add chart data success', async () => {
    expect.hasAssertions();
    const getSocketClient = jest.spyOn(SocketInstances.Admin, 'getSocketClient').mockReturnValue(socket);
    const getAllReportViewer = jest.spyOn(reportCachingService, 'getAllReportViewer').mockResolvedValue(userIds);
    const addChartData = jest.spyOn(gateway, 'addChartData');
    gateway.addChartData(payload);
    expect(addChartData).toHaveBeenCalledTimes(1);
    expect(addChartData).toHaveBeenCalledWith(payload);
    expect(getAllReportViewer).toHaveBeenCalledTimes(1);
    await getAllReportViewer.mock.results[0].value.then(() => {
      expect(getSocketClient).toHaveBeenCalledTimes(userIds.length);
      expect(getSocketClient.mock.calls).toEqual([userIds]);
      expect(socket.emit).toHaveBeenCalledTimes(userIds.length);
      expect(socket.emit.mock.calls).toEqual(emitParameters);
    });
  });

  it('add chart data failed by getAllReportViewer got unknown error', async () => {
    expect.hasAssertions();
    const log = jest.spyOn(loggerService, 'error');
    const getSocketClient = jest.spyOn(SocketInstances.Admin, 'getSocketClient');
    const getAllReportViewer = jest.spyOn(reportCachingService, 'getAllReportViewer').mockRejectedValue(UnknownError);
    const addChartData = jest.spyOn(gateway, 'addChartData');
    gateway.addChartData(payload);
    expect(addChartData).toHaveBeenCalledTimes(1);
    expect(addChartData).toHaveBeenCalledWith(payload);
    expect(getAllReportViewer).toHaveBeenCalledTimes(1);
    await getAllReportViewer.mock.results[0].value.catch(() => {});
    expect(getSocketClient).not.toHaveBeenCalled();
    expect(socket.emit).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(UnknownError.message, expect.any(String));
  });

  it('add chart data failed by getSocketClient return undefined', async () => {
    expect.hasAssertions();
    const getSocketClient = jest.spyOn(SocketInstances.Admin, 'getSocketClient').mockReturnValue(undefined);
    const getAllReportViewer = jest.spyOn(reportCachingService, 'getAllReportViewer').mockResolvedValue(userIds);
    const addChartData = jest.spyOn(gateway, 'addChartData');
    gateway.addChartData(payload);
    expect(addChartData).toHaveBeenCalledTimes(1);
    expect(addChartData).toHaveBeenCalledWith(payload);
    expect(getAllReportViewer).toHaveBeenCalledTimes(1);
    await getAllReportViewer.mock.results[0].value.then(() => {
      expect(getSocketClient).toHaveBeenCalledTimes(userIds.length);
      expect(getSocketClient.mock.calls).toEqual([userIds]);
      expect(socket.emit).not.toHaveBeenCalled();
    });
  });
});
