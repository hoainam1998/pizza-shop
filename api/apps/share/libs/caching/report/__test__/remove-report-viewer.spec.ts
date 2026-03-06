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

describe('remove report viewer', () => {
  it('remove report viewer success', async () => {
    expect.hasAssertions();
    const sRem = jest.spyOn(redisClient.Client, 'sRem').mockResolvedValue(result);
    const removeReportViewer = jest.spyOn(reportCachingService, 'removeReportViewer');
    await expect(reportCachingService.removeReportViewer(userId)).resolves.toBe(result);
    expect(removeReportViewer).toHaveBeenCalledTimes(1);
    expect(sRem).toHaveBeenCalledTimes(1);
    expect(sRem).toHaveBeenCalledWith(reportViewerKey, userId);
  });

  it('remove report viewer failed', async () => {
    expect.hasAssertions();
    const sRem = jest.spyOn(redisClient.Client, 'sRem').mockRejectedValue(UnknownError);
    const removeReportViewer = jest.spyOn(reportCachingService, 'removeReportViewer');
    await expect(reportCachingService.removeReportViewer(userId)).rejects.toThrow(UnknownError);
    expect(removeReportViewer).toHaveBeenCalledTimes(1);
    expect(sRem).toHaveBeenCalledTimes(1);
    expect(sRem).toHaveBeenCalledWith(reportViewerKey, userId);
  });
});
