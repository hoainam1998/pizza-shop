import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig, portConfig, emailConfig, throttleConfig, sessionConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, portConfig, emailConfig, throttleConfig, sessionConfig],
      isGlobal: true,
    }),
  ],
})
export default class EnvironmentConfigModule {}
