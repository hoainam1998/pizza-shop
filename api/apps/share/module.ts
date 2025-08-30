import { Module, Provider } from '@nestjs/common';
import EnvironmentConfigModule from './environment-config/environment-config.module';
import { PrismaClient } from 'generated/prisma';
import { PRISMA_CLIENT } from './di-token';

const prismaClient: Provider = {
  provide: PRISMA_CLIENT,
  useValue: new PrismaClient(),
};

@Module({
  imports: [EnvironmentConfigModule],
  providers: [prismaClient],
  exports: [prismaClient],
})
export default class ShareModule {}
