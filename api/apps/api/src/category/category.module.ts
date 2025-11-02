import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ClientProvider, ClientsModule, Transport } from '@nestjs/microservices';
import multer from 'multer';
import CategoryController from './category.controller';
import CategoryService from './category.service';
import { CATEGORY_SERVICE } from '@share/di-token';
import { ConfigService } from '@nestjs/config';
import LoggingModule from '@share/libs/logging/logging.module';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        useFactory: (configService: ConfigService): ClientProvider => {
          return {
            transport: Transport.TCP,
            options: {
              port: parseInt(configService.get<string>('ports.CATEGORY_MICROSERVICE_TCP_PORT')!),
            },
          };
        },
        inject: [ConfigService],
        name: CATEGORY_SERVICE,
      },
    ]),
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
    LoggingModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export default class CategoryModule {}
