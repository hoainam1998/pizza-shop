import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import {
  HealthCheckService,
  MicroserviceHealthIndicator,
  HealthIndicatorResult,
  HealthCheckResult,
} from '@nestjs/terminus';

@Injectable()
export default class HealthyService {
  constructor(
    private health: HealthCheckService,
    private microservice: MicroserviceHealthIndicator,
    private readonly configService: ConfigService,
  ) {}

  private check(name: string, port: string): Promise<HealthIndicatorResult> {
    return this.microservice.pingCheck(`${name}_microservice`, {
      transport: Transport.TCP,
      options: {
        host: process.env.NODE_ENV === 'docker' ? 'host.docker.internal' : process.env.LOCALHOST,
        port: this.configService.get<string>(`ports.${port}`)!,
      },
    });
  }

  checkAll(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.check('socket', 'SOCKET_MICROSERVICE_TCP_PORT'),
      () => this.check('user', 'USER_MICROSERVICE_TCP_PORT'),
      () => this.check('category', 'CATEGORY_MICROSERVICE_TCP_PORT'),
      () => this.check('ingredient', 'INGREDIENT_MICROSERVICE_TCP_PORT'),
      () => this.check('product', 'PRODUCT_MICROSERVICE_TCP_PORT'),
    ]);
  }
}
