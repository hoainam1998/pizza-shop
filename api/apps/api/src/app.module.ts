import { Module } from '@nestjs/common';
import ProductModule from './product/product.module';
import IngredientModule from './ingredient/ingredient.module';
import ShareModule from 'apps/share/module';
import CategoryModule from './category/category.module';
import UserModule from './user/user.module';

@Module({
  imports: [ShareModule, CategoryModule, UserModule, IngredientModule, ProductModule],
  controllers: [],
  providers: [ShareModule],
})
export default class AppModule {}
