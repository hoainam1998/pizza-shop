import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { MatcherPipe } from '@share/pipes';
import { Unit } from 'generated/prisma';

type UnitOptions = {
  label: string;
  value: string;
};

const generateUnitOptions = (units: string[]): UnitOptions[] => {
  return units.map((unit) => ({ label: unit, value: unit }));
};

@Controller('unit')
export default class UnitController {
  @Get()
  @HttpCode(HttpStatus.OK)
  getAllUnits(@Query('of', new MatcherPipe(['product', 'ingredient'])) of: string): UnitOptions[] {
    if (of === 'product') {
      return generateUnitOptions(Object.values(Unit).filter((unit) => unit !== Unit.GRAM));
    }
    return generateUnitOptions(Object.values(Unit));
  }
}
