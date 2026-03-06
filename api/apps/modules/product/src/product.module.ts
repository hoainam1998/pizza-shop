import { Module } from '@nestjs/common';
import { ClientsModule, ClientProvider, Transport } from '@nestjs/microservices';
import ProductController from './product.controller';
import ProductService from './product.service';
import ShareModule from '@share/module';
import LoggingModule from '@share/libs/logging/logging.module';
import { ConfigService } from '@nestjs/config';
import { SOCKET_SERVICE } from '@share/di-token';

@Module({
  imports: [
    ShareModule,
    LoggingModule,
    ClientsModule.registerAsync([
      {
        useFactory: (configService: ConfigService): ClientProvider => {
          return {
            transport: Transport.TCP,
            options: {
              port: parseInt(configService.get<string>('ports.SOCKET_MICROSERVICE_TCP_PORT')!),
            },
          };
        },
        inject: [ConfigService],
        name: SOCKET_SERVICE,
      },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export default class ProductModule {}
