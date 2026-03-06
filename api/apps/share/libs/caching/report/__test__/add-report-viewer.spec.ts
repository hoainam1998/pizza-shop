import startUp from './pre-setup';
import ReportCachingService from '../report.service';
import RedisClient from '@share/libs/redis-client/redis';
import { REDIS_CLIENT } from '@share/di-token';
import constants from '@share/constants';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
const reportViewerKey = constants.REDIS_PREFIX.REPORT_VIEWER;

let reportCachingService: ReportCachingService;
let redisClient: RedisClient;
const result: number = 1;
const userId: string = Date.now().toString();

beforeAll(async () => {
  const moduleRef = await startUp();
  reportCachingService = moduleRef.get(ReportCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('add report viewer', () => {
  it('add report viewer success', async () => {
    expect.hasAssertions();
    const sAdd = jest.spyOn(redisClient.Client, 'sAdd').mockResolvedValue(result);
    const addReportViewer = jest.spyOn(reportCachingService, 'addReportViewer');
    await expect(reportCachingService.addReportViewer(userId)).resolves.toBe(result);
    expect(addReportViewer).toHaveBeenCalledTimes(1);
    expect(sAdd).toHaveBeenCalledTimes(1);
    expect(sAdd).toHaveBeenCalledWith(reportViewerKey, userId);
  });

  it('add report viewer failed', async () => {
    expect.hasAssertions();
    const sAdd = jest.spyOn(redisClient.Client, 'sAdd').mockRejectedValue(UnknownError);
    const addReportViewer = jest.spyOn(reportCachingService, 'addReportViewer');
    await expect(reportCachingService.addReportViewer(userId)).rejects.toThrow(UnknownError);
    expect(addReportViewer).toHaveBeenCalledTimes(1);
    expect(sAdd).toHaveBeenCalledTimes(1);
    expect(sAdd).toHaveBeenCalledWith(reportViewerKey, userId);
  });
});
