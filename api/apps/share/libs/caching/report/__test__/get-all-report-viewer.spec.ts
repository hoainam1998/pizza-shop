import startUp from './pre-setup';
import ReportCachingService from '../report.service';
import RedisClient from '@share/libs/redis-client/redis';
import { REDIS_CLIENT } from '@share/di-token';
import constants from '@share/constants';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
const reportViewerKey = constants.REDIS_PREFIX.REPORT_VIEWER;

let reportCachingService: ReportCachingService;
let redisClient: RedisClient;
const userIds: string[] = [Date.now().toString()];

beforeAll(async () => {
  const moduleRef = await startUp();
  reportCachingService = moduleRef.get(ReportCachingService);
  redisClient = moduleRef.get(REDIS_CLIENT);
});

describe('get all report viewer', () => {
  it('get all report viewer success', async () => {
    const checkExists = jest.spyOn(reportCachingService, 'checkExists').mockResolvedValue(true);
    const sMembers = jest.spyOn(redisClient.Client, 'sMembers').mockResolvedValue(userIds);
    const getAllReportViewer = jest.spyOn(reportCachingService, 'getAllReportViewer');
    await expect(reportCachingService.getAllReportViewer()).resolves.toBe(userIds);
    expect(getAllReportViewer).toHaveBeenCalledTimes(1);
    expect(checkExists).toHaveBeenCalledTimes(1);
    expect(sMembers).toHaveBeenCalledTimes(1);
    expect(sMembers).toHaveBeenCalledWith(reportViewerKey);
  });

  it('get all report viewer failed by checkExists return false', async () => {
    const checkExists = jest.spyOn(reportCachingService, 'checkExists').mockResolvedValue(false);
    const sMembers = jest.spyOn(redisClient.Client, 'sMembers');
    const getAllReportViewer = jest.spyOn(reportCachingService, 'getAllReportViewer');
    await expect(reportCachingService.getAllReportViewer()).resolves.toEqual([]);
    expect(getAllReportViewer).toHaveBeenCalledTimes(1);
    expect(checkExists).toHaveBeenCalledTimes(1);
    expect(sMembers).not.toHaveBeenCalled();
  });

  it('get all report viewer failed by checkExists got unknown error', async () => {
    const checkExists = jest.spyOn(reportCachingService, 'checkExists').mockRejectedValue(UnknownError);
    const sMembers = jest.spyOn(redisClient.Client, 'sMembers');
    const getAllReportViewer = jest.spyOn(reportCachingService, 'getAllReportViewer');
    await expect(reportCachingService.getAllReportViewer()).rejects.toThrow(UnknownError);
    expect(getAllReportViewer).toHaveBeenCalledTimes(1);
    expect(checkExists).toHaveBeenCalledTimes(1);
    expect(sMembers).not.toHaveBeenCalled();
  });

  it('get all report viewer failed by sMembers got unknown error', async () => {
    const checkExists = jest.spyOn(reportCachingService, 'checkExists').mockResolvedValue(true);
    const sMembers = jest.spyOn(redisClient.Client, 'sMembers').mockRejectedValue(UnknownError);
    const getAllReportViewer = jest.spyOn(reportCachingService, 'getAllReportViewer');
    await expect(reportCachingService.getAllReportViewer()).rejects.toThrow(UnknownError);
    expect(getAllReportViewer).toHaveBeenCalledTimes(1);
    expect(checkExists).toHaveBeenCalledTimes(1);
    expect(sMembers).toHaveBeenCalledTimes(1);
    expect(sMembers).toHaveBeenCalledWith(reportViewerKey);
  });
});
