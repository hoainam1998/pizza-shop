import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import ProductModule from './product/product.module';
import IngredientModule from './ingredient/ingredient.module';
import ShareModule from 'apps/share/module';
import CategoryModule from './category/category.module';
import UserModule from './user/user.module';

@Module({
  imports: [
    ShareModule,
    CategoryModule,
    UserModule,
    IngredientModule,
    ProductModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('throttle.THROTTLE_TTL')!,
          limit: config.get('throttle.THROTTLE_LIMIT')!,
        },
      ],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export default class AppModule {}
