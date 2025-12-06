import { HttpStatus } from '@nestjs/common';
import { user, category, product, ingredient } from 'generated/prisma';

export type CategoryBodyType = category & {
  disabled?: boolean;
};

export type PaginationResponse<T> = {
  list: T[];
  total: number;
};

export type CategoryPaginationResponse = PaginationResponse<CategoryBodyType>;

export type ProductPaginationResponse = PaginationResponse<product>;

export type IngredientPrismaOmitType = Omit<
  ingredient,
  'units' | 'ingredientId' | '_count' | 'disabled' | 'expiredTime'
>;

export type IngredientPaginationResponse = PaginationResponse<IngredientPrismaOmitType>;

export type CategoryPaginationPrismaResponse = (CategoryBodyType[] | number)[];

export type ProductPaginationPrismaResponse = (product[] | number)[];

export type IngredientPaginationPrismaResponseType = (ingredient[] | number)[];

export type EventPatternType = { cmd: string };

export type MicroservicesErrorResponse = {
  status: HttpStatus;
  response?: any;
  message?: string;
  code: string;
} & Error;

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
  ingredientId: string;
  amount: number;
  unit: string;
};

export type IngredientSelectType = {
  ingredient_id: boolean;
  name: boolean;
  avatar: boolean;
  unit: boolean;
  count: boolean;
  expired_time: boolean;
  status: boolean;
  price: boolean;
};

export type ValidationCustomErrorType = {
  messages: (string | string[])[];
};

export type MessagesType = {
  messages: string[];
};

export type UserRequestType = Omit<user, 'password' | 'reset_password_token'> & {
  plain_password?: string;
  password?: string;
  reset_password_token?: string;
};

export type UserCreateType = Pick<user, 'first_name' | 'last_name' | 'email' | 'phone' | 'sex'>;

export type MessageResponseTestingType = {
  messages: string[];
  errorCode?: string;
};

export type AdminResetPasswordTokenPayload = {
  email: string;
  password: string;
};
