import { type ClientCartItemType } from '@/interfaces';

export type ServerCartItemType = {
  productId: string;
  name: string;
  avatar: string;
  count: number;
  price: number;
};

export type ErrorCartItemType = {
  productId: string;
  errorCode: string;
  messages: string[];
};

export type ClientErrorCartItemType = {
  isFresh?: boolean;
  isDisable?: boolean;
  messages: string[];
};

export type NeededCartItemType = Omit<ClientCartItemType, 'productId' | 'quantity' | 'total'>;

export type BillItemType = Pick<ClientCartItemType, 'productId' | 'price' | 'quantity' | 'total'>;

export type PaymentErrorType = {
  errors: ErrorCartItemType[];
  totalErrorMessage: string | null;
  validateResult: boolean;
};
