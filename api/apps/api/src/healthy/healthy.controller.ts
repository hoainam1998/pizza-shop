import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckResult } from '@nestjs/terminus';
import { Public } from '@share/decorators/auths';
import { HealthyRouter } from '@share/router';
import HealthyService from './healthy.service';

@Controller(HealthyRouter.BaseUrl)
export default class HealthyController {
  constructor(private healthService: HealthyService) {}

  @Get()
  @Public()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.healthService.checkAll();
  }
}
