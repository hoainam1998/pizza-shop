import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AppModule from './app.module';
import { HttpExceptionFilter, PrismaDisconnectExceptionFilter } from '@share/exception-filter';
import corsConfig from './cors-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: corsConfig });
  const config: ConfigService = app.get(ConfigService);
  const port = config.get<number | string>('ports.API_PORT') || 5000;
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaDisconnectExceptionFilter());
  await app.listen(port, () => Logger.log(`App started at ${port}`, 'App Bootstrap'));
}
bootstrap();
