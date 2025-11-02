import { Module } from '@nestjs/common';
import IngredientService from './ingredient.service';
import IngredientController from './ingredient.controller';
import { ClientProvider, ClientsModule, Transport } from '@nestjs/microservices';
import { INGREDIENT_SERVICE } from '@share/di-token';
import { ConfigService } from '@nestjs/config';
import ShareModule from '@share/module';
import LoggingModule from '@share/libs/logging/logging.module';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        useFactory: (configService: ConfigService): ClientProvider => {
          return {
            transport: Transport.TCP,
            options: {
              port: parseInt(configService.get<string>('ports.INGREDIENT_MICROSERVICE_TCP_PORT')!),
            },
          };
        },
        inject: [ConfigService],
        name: INGREDIENT_SERVICE,
      },
    ]),
    ShareModule,
    LoggingModule,
  ],
  providers: [IngredientService],
  controllers: [IngredientController],
})
export default class IngredientModule {}
