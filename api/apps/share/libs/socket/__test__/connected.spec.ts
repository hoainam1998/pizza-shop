import startUp from './pre-setup';
import SocketConnected from '../event-socket/socket-connected';
import SocketInstances from '../socket-instances/socket-instances';
import { VIEW } from '@share/enums';
import ReportCachingService from '@share/libs/caching/report/report.service';

let socketConnected: SocketConnected;
let reportCachingService: ReportCachingService;
let close: () => Promise<void>;
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
  socketConnected = moduleRef.get(SocketConnected);
  reportCachingService = moduleRef.get(ReportCachingService);
  close = () => moduleRef.close();
});

afterAll(async () => {
  await close();
});

describe('socket connected', () => {
  it('socket connected success', (done) => {
    expect.hasAssertions();
    const addReportViewer = jest.spyOn(reportCachingService, 'addReportViewer');
    const addSocketClient = jest.spyOn(SocketInstances, 'addSocketClient').mockImplementation(jest.fn);
    const connected = jest.spyOn(socketConnected, 'connected');
    socketConnected.connected(payload, socket);
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
    const connected = jest.spyOn(socketConnected, 'connected');
    socketConnected.connected(clientViewPayload, socket);
    expect(connected).toHaveBeenCalledTimes(1);
    expect(addSocketClient).toHaveBeenCalledTimes(1);
    expect(addSocketClient).toHaveBeenCalledWith(clientViewPayload, socket);
    expect(addReportViewer).not.toHaveBeenCalled();
    expect(socket.on).toHaveBeenCalledTimes(1);
    expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    done();
  });
});
