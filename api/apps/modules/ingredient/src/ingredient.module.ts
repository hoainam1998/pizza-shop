import { Logger, Module } from '@nestjs/common';
import IngredientController from './ingredient.controller';
import IngredientService from './ingredient.service';
import ShareModule from '@share/module';

@Module({
  imports: [ShareModule],
  controllers: [IngredientController],
  providers: [IngredientService, Logger],
})
export default class IngredientModule {}
