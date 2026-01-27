export type CartItemPropsType = {
  cart: {
    productId: string;
    name: string;
    avatar: string;
    limit: number;
    quantity: number;
    total: number;
    price: number;
    noExist: boolean;
    messages: string[];
    isFresh?: boolean;
    isDisable?: boolean;
  };
};

export type CartItemInfoType = CartItemPropsType['cart'] & {
  delete: () => void;
  fresh: () => void;
  calcTotal: (quantity: number) => void;
};
