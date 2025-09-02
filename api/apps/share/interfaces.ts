import { HttpStatus } from '@nestjs/common';

export type CategoryBody = {
  category_id?: string;
  name: string;
  avatar: string;
  disabled?: boolean;
};

export type CategoryPaginationResponse = {
  list: CategoryBody[];
  total: number;
};

export type CategoryPaginationPrismaResponse = (CategoryBody[] | number)[];

export type EventPatternType = { cmd: string };

export type MicroservicesErrorResponse = {
  status: HttpStatus;
  response?: any;
  message?: string;
};

export type MessageResponse = {
  message: string;
};
