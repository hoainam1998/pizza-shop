import startUp from './pre-setup';
import EventsGateway from '../event-socket.gateway';
import SocketInstances from '../socket-instances/socket-instances';
import { VIEW } from '@share/enums';
import ReportCachingService from '@share/libs/caching/report/report.service';

let gateway: EventsGateway;
let reportCachingService: ReportCachingService;
const userId = Date.now().toString();
const payload = {
  userId,
  view: VIEW.ADMIN,
};

const socket: any = {
  on: jest.fn(),
};

beforeAll(async () => {
  const moduleRef = await startUp();
  gateway = moduleRef.get(EventsGateway);
  reportCachingService = moduleRef.get(ReportCachingService);
});

describe('socket connected', () => {
  it('socket connected success', (done) => {
    expect.hasAssertions();
    const addReportViewer = jest.spyOn(reportCachingService, 'addReportViewer');
    const addSocketClient = jest.spyOn(SocketInstances, 'addSocketClient').mockImplementation(jest.fn);
    const connected = jest.spyOn(gateway, 'connected');
    gateway.connected(payload, socket);
    expect(connected).toHaveBeenCalledTimes(1);
    expect(addSocketClient).toHaveBeenCalledTimes(1);
    expect(addSocketClient).toHaveBeenCalledWith(payload, socket);
    expect(addReportViewer).toHaveBeenCalledTimes(1);
    expect(addReportViewer).toHaveBeenCalledWith(payload.userId);
    expect(socket.on).toHaveBeenCalledTimes(1);
    expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    done();
  });

  it('socket connected success with client view', (done) => {
    const clientViewPayload = { ...payload, view: VIEW.CLIENT };
    expect.hasAssertions();
    const addReportViewer = jest.spyOn(reportCachingService, 'addReportViewer');
    const addSocketClient = jest.spyOn(SocketInstances, 'addSocketClient').mockImplementation(jest.fn);
    const connected = jest.spyOn(gateway, 'connected');
    gateway.connected(clientViewPayload, socket);
    expect(connected).toHaveBeenCalledTimes(1);
    expect(addSocketClient).toHaveBeenCalledTimes(1);
    expect(addSocketClient).toHaveBeenCalledWith(clientViewPayload, socket);
    expect(addReportViewer).not.toHaveBeenCalled();
    expect(socket.on).toHaveBeenCalledTimes(1);
    expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    done();
  });
});
