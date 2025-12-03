import type { AxiosRequestConfig } from 'axios';

export type TableFieldType = {
  key: string;
  label?: string;
  width?: number;
};

export type MessageResponseType = {
  messages: string;
};

export type IngredientType = {
  ingredientId: string;
  name?: string;
  avatar?: string;
  amount?: number;
  unit?: string;
  units?: string[];
  price?: number;
  count?: number;
  expiredTime?: string;
  status: string;
  disabled?: boolean;
};

export type OptionType = {
  value: string;
  label: string;
};

export type CategoryType = {
  categoryId: string;
  name: string;
  avatar: string;
};

export type ExtraConfigs = AxiosRequestConfig & {
  allowNotFound?: boolean;
  showSpinner?: boolean;
};

export type LoginResponseType = {
  lastName: string;
  firstName: string;
  avatar?: string;
  email: string;
  phone: string;
  resetPasswordToken: string;
  isFirstTime: boolean;
  userId: string;
  power: number;
  sex: number;
};
