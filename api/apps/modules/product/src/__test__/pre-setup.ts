import { ClientProvider, ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import ProductController from '../product.controller';
import ProductService from '../product.service';
import ShareTestingModule from '@share/test/module';
import ShareModule from '@share/module';
import LoggingModule from '@share/libs/logging/logging.module';
import { SOCKET_SERVICE } from '@share/di-token';

export default (): Promise<TestingModule> => {
  return Test.createTestingModule({
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
    .overrideProvider(SOCKET_SERVICE)
    .useValue({
      emit: jest.fn(),
    })
    .overrideModule(ShareModule)
    .useModule(ShareTestingModule)
    .compile();
};
