import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig, portConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, portConfig],
      isGlobal: true,
    }),
  ],
})
export default class EnvironmentConfigModule {}
