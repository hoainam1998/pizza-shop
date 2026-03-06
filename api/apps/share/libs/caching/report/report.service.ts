import { Injectable } from '@nestjs/common';
import CachingService from '../caching';
import constants from '@share/constants';

const reportViewerKey = constants.REDIS_PREFIX.REPORT_VIEWER;

@Injectable()
export default class ReportCachingService extends CachingService {
  checkExists(): Promise<boolean> {
    return this.exists(reportViewerKey);
  }

  addReportViewer(userId: string): Promise<number> {
    return this.RedisClientInstance.sAdd(reportViewerKey, userId);
  }

  removeReportViewer(userId: string): Promise<number> {
    return this.RedisClientInstance.sRem(reportViewerKey, userId);
  }

  async getAllReportViewer(): Promise<string[]> {
    if (await this.checkExists()) {
      return this.RedisClientInstance.sMembers(reportViewerKey);
    } else {
      return Promise.resolve([]);
    }
  }
}
