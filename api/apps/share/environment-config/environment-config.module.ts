import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig, portConfig, emailConfig, throttleConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, portConfig, emailConfig, throttleConfig],
      isGlobal: true,
    }),
  ],
})
export default class EnvironmentConfigModule {}
