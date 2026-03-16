import type { AxiosRequestConfig } from 'axios';
import { CHART_MODE } from '@/enums';

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

export type ClientCartItemType = {
  productId: string;
  name: string;
  avatar: string;
  limit: number;
  quantity: number;
  total: number;
  price: number;
};

export type SizeChartType = {
  height?: string | number;
  width?: string | number;
};

export type ChartPayloadType = {
  by: CHART_MODE;
  time: number;
};

export type BestSellingProductsChartPropsType = {
  values: number[];
  labels: string[];
};

export type RealTimeShoppingChartPropsType = {
  revenue: number[];
  capital: number[];
};

export type RevenueChartPropsType = RealTimeShoppingChartPropsType & { labels: string[] };

export type UserDetailModelType = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sex: number;
  power: number | null;
};

export type UserDetailExposeType = {
  validate: () => Promise<boolean>,
  reset: () => void,
};
