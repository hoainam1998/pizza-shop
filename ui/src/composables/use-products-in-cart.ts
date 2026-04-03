import { reactive, onMounted } from 'vue';
import IndexedDb from '@/indexed-db';
import { OBJECT_STORE_NAME } from '@/enums';

type ProductInCart = {
  productId: string;
  quantity: number;
};

const calcCartTotal = (): Promise<number> => {
  return IndexedDb.getAll(OBJECT_STORE_NAME.CARTS).then((products) => {
    return products.reduce((total: number, product: ProductInCart) => {
      total += product.quantity;
      return total;
    }, 0);
  });
};

const cart = reactive({
  total: 0,
  async calcTotal() {
    this.total = await calcCartTotal();;
  },
});

export default function () {
  onMounted(async () => {
    cart.total = await calcCartTotal();
  });

  return cart;
}
