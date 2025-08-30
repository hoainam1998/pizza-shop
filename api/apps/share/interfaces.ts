import { HttpStatus } from '@nestjs/common';
import { CategoryFormatter } from './serializer/category';

export type CategoryBody = {
  category_id?: string;
  name: string;
  avatar: string;
};

export type CategoryPaginationResponse = {
  list: CategoryFormatter[];
  total: number;
};

export type CategoryPaginationPrismaResponse = (CategoryBody[] | number)[];

export type EventPatternType = { cmd: string };

export type MicroservicesErrorResponse = {
  status: HttpStatus;
  response?: any;
  message?: string;
};
