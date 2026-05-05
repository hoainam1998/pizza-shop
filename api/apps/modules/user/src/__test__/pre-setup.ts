import { ClientProvider, ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import UserController from '../user.controller';
import UserService from '../user.service';
import ShareTestingModule from '@share/test/module';
import ShareModule from '@share/module';
import LoggingModule from '@share/libs/logging/logging.module';
import { SOCKET_SERVICE } from '@share/di-token';
import UserCachingService from '@share/libs/caching/user/user.service';

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
    controllers: [UserController],
    providers: [UserService],
  })
    .overrideProvider(SOCKET_SERVICE)
    .useValue({
      emit: jest.fn(),
    })
    .overrideProvider(UserCachingService)
    .useValue({
      logoutSubscribe: jest.fn(),
      checkUserAlreadyLogged: jest.fn(),
    })
    .overrideModule(ShareModule)
    .useModule(ShareTestingModule)
    .compile();
};
