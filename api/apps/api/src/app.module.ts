import { Inject, MiddlewareConsumer, Module, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaClient } from 'generated/prisma';
import { xss } from 'express-xss-sanitizer';
import ProductModule from './product/product.module';
import IngredientModule from './ingredient/ingredient.module';
import ShareModule from '@share/module';
import CategoryModule from './category/category.module';
import UserModule from './user/user.module';
import AuthGuard from '@share/guards/auth.service';
import { PRISMA_CLIENT, REDIS_CLIENT } from '@share/di-token';
import RedisClient from '@share/libs/redis-client/redis';
import { startUp, shutDown } from './events';

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
          ttl: +config.get('throttle.THROTTLE_TTL')!,
          limit: +config.get('throttle.THROTTLE_LIMIT')!,
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
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export default class AppModule implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prismaClient: PrismaClient,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClient,
  ) {}

  onApplicationBootstrap() {
    startUp(this.redisClient, this.prismaClient);
  }

  onApplicationShutdown() {
    void shutDown(this.redisClient, this.prismaClient);
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(xss({ allowedKeys: ['oldPassword'] })).forRoutes('*');
  }
}
