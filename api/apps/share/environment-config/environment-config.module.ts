import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig, portConfig, emailConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, portConfig, emailConfig],
      isGlobal: true,
    }),
  ],
})
export default class EnvironmentConfigModule {}
