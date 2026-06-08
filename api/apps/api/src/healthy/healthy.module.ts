import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import HealthyService from './healthy.service';
import HealthyController from './healthy.controller';

@Module({
  imports: [TerminusModule],
  providers: [HealthyService],
  controllers: [HealthyController],
})
export default class HealthyModule {}
