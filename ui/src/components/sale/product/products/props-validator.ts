export type ProductPropsType = {
  total: number | string;
  products: {
    productId: string;
    name: string;
    avatar: string;
    price: number;
    ingredients: {
      name: string;
    };
  }[];
};
