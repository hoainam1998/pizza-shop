import { Module } from '@nestjs/common';
import ProductService from './product.service';
import ProductController from './product.controller';
import ShareModule from '@share/module';
import { ClientProvider, ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PRODUCT_SERVICE } from '@share/di-token';
import LoggingModule from '@share/libs/logging/logging.module';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        useFactory: (configService: ConfigService): ClientProvider => {
          return {
            transport: Transport.TCP,
            options: {
              port: parseInt(configService.get<string>('ports.PRODUCT_MICROSERVICE_TCP_PORT')!),
            },
          };
        },
        inject: [ConfigService],
        name: PRODUCT_SERVICE,
      },
    ]),
    ShareModule,
    LoggingModule,
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export default class ProductModule {}
