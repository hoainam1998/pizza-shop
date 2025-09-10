import { Module } from '@nestjs/common';
import UnitController from './unit.controller';

@Module({
  controllers: [UnitController],
})
export class UnitModule {}
