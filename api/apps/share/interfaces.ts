import { HttpStatus } from '@nestjs/common';
import { user, category } from 'generated/prisma';

export type CategoryBody = Omit<category, 'category_id'> & {
  category_id?: category['category_id'];
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

export type MessageResponseType = {
  message: string;
  errorCode?: string;
};

export type SignupUserPayloadType = {
  user: user;
  canSignup: boolean;
};

export type UserCreatedType = user & {
  plain_password: string;
};

export type ProductIngredientType = {
  id: string;
  amount: number;
  unit: string;
};

export type IngredientSelectType = {
  name: boolean;
  avatar: boolean;
  unit: boolean;
  count: boolean;
  expired_time: boolean;
  status: boolean;
  price: boolean;
};
