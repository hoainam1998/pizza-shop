import { Module } from '@nestjs/common';
import IngredientController from './ingredient.controller';
import IngredientService from './ingredient.service';
import ShareModule from '@share/module';
import LoggingModule from '@share/libs/logging/logging.module';

@Module({
  imports: [ShareModule, LoggingModule],
  controllers: [IngredientController],
  providers: [IngredientService],
})
export default class IngredientModule {}
