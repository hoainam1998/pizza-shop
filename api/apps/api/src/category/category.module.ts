import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ClientsModule, Transport } from '@nestjs/microservices';
import multer from 'multer';
import CategoryController from './category.controller';
import CategoryService from './category.service';
import { CATEGORY_SERVICE } from 'apps/share/di-token';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: CATEGORY_SERVICE,
        transport: Transport.TCP,
        options: {
          port: parseInt(process.env.CATEGORY_MICROSERVICE_TCP_PORT!),
        },
      },
    ]),
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export default class CategoryModule {}
