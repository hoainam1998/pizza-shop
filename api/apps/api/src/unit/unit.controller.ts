import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Unit } from 'generated/prisma';

type UnitOptions = {
  label: string;
  value: string;
};

@Controller('unit')
export default class UnitController {
  @Get()
  @HttpCode(HttpStatus.OK)
  getAllUnits(): UnitOptions[] {
    return Object.values(Unit).map((unit) => ({ label: unit, value: unit }));
  }
}
