export type PropsType = {
  cart: {
    name: string;
    quantity: number;
    total: number;
    price: number;
    noExist: boolean;
  };
};

export default {
  cart: {
    type: Object,
    required: true,
    validator(value: PropsType['cart']): boolean {
      return Object.entries(value).every(([key, value]) => {
        switch (key) {
          case 'name':
            return typeof value === 'string' && value.trim() !== '';
          case 'quantity':
          case 'total':
          case 'price':
            return typeof value === 'number' && Number.isInteger(value);
          case 'noExist':
            return typeof value === 'boolean';
          default:
            return true;
        }
      });
    },
  },
};
