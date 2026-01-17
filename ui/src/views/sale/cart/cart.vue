<template>
  <section class="ps-py-10 ps-py-10 ps-px-10 ps-bg-transparent">
    <div class="ps-bg-white ps-border-radius-5 ps-py-10 ps-px-10">
      <div class="ps-display-flex ps-flex-gap-10 ps-flex-direction-mobile-column ps-flex-direction-desktop-row">
        <ul class="ps-w-mobile-100
          ps-w-large-tablet-60
          ps-w-tablet-50
          ps-w-desktop-60
          ps-list-style-none
          ps-pl-0
          ps-max-h-88vh
          ps-overflow-y-auto">
            <List :items="cartItems" keyField="productId">
              <template #default="{ item }">
                <li class="ps-mb-10
                  ps-border-width-1
                  ps-border-radius-5
                  ps-border-color-black
                  ps-border-style-dashed">
                    <CartItem
                      :cart="item"
                      @delete="item.delete"
                      @calcTotal="item.calcTotal"/>
                </li>
              </template>
            </List>
        </ul>
        <div class="ps-w-mobile-100
          ps-w-tablet-50
          ps-w-large-tablet-40
          ps-w-desktop-40
          ps-px-desktop-10
          ps-px-mobile-0">
            <h2 class="ps-fw-bold ps-text-transform-capitalize">Bills</h2>
            <hr />
            <ul class="ps-list-style-none ps-max-h-80vh ps-overflow-y-auto ps-pl-0">
              <List :items="cartItems" keyField="productId">
                <template #default="{ item }">
                  <li><BillItem :cart="item" /></li>
                </template>
              </List>
            </ul>
            <div class="ps-display-flex ps-mt-10 ps-justify-content-space-between ps-align-items-center">
              <span>
                <span class="ps-fw-bold">Total:&nbsp;</span>
                <span class="ps-text-style-italic">{{ $formatVNDCurrency(total) }}</span>
              </span>
              <el-button type="primary" class="ps-w-mobile-100px">
                Payment
              </el-button>
            </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue';
import CartItem from '@/components/sale/cart/cart-item.vue';
import BillItem from '@/components/sale/cart/bill-item.vue';
import List from '@/components/common/list.vue';
import SocketService from '@/socket';
import IndexedDb from '@/indexed-db';
import { OBJECT_STORE_NAME, SOCKET_EVENT_NAME } from '@/enums';
import { ProductService } from '@/services';
import { useProductsInCart } from '@/composables/store';
import { grayColor } from '@/assets/scss/variables.module.scss';
import { type ClientCartItemType } from '@/interfaces';

type ServerCartItemType = {
  productId: string;
  name: string;
  avatar: string;
  count: number;
  price: number;
};

type NeededCartItemType = Omit<ClientCartItemType, 'productId' | 'quantity' | 'total'>;

const cart = useProductsInCart();
const clientCartItems = ref<ClientCartItemType[]>();
const serverCartItemGroups = ref<Record<string, ServerCartItemType>>({});

const total = computed<number>(() => {
  return cartItems.value.reduce((count, cart) => {
    if (!cart.noExist) {
      count += cart.total;
    }
    return count;
  }, 0);
});

const cartItems = computed(() => {
  return (clientCartItems.value || []).map((cartItem) => {
    const serverCartItem = serverCartItemGroups.value[cartItem.productId as keyof typeof serverCartItemGroups.value];
    const validCartItem = createCartItem(serverCartItem) || cartItem;

    return {
      productId: cartItem.productId,
      name: validCartItem.name,
      avatar: validCartItem.avatar,
      quantity: cartItem.quantity,
      limit: validCartItem.limit,
      price: validCartItem.price,
      total: cartItem.quantity * validCartItem.price,
      noExist: !serverCartItem,
      delete: deleteCart(cartItem.productId),
      calcTotal: calcTotal(cartItem.productId),
    };
  });
});

const productIds = computed<string[]>(() => {
  return (clientCartItems.value || []).map((item) => item.productId);
});

const deleteCart = (productId: string) => (): void => {
  IndexedDb.delete(OBJECT_STORE_NAME.CARTS, productId)
    .then(() => {
      getAllClientCartItems();
      cart.calcTotal();
    });
};

const calcTotal = (productId: string) => (quantity: number): void => {
  IndexedDb.get(OBJECT_STORE_NAME.CARTS, productId)
    .then((item) => {
      if (item) {
        const total = item.price * quantity;
        IndexedDb.update(OBJECT_STORE_NAME.CARTS, { ...item, quantity, total })
          .then(() => {
            getAllClientCartItems();
            cart.calcTotal();
          });
      }
    });
};

const createCartItem = (cartItem?: ServerCartItemType): NeededCartItemType | undefined => {
  if (cartItem) {
    return {
      name: cartItem.name,
      avatar: cartItem.avatar,
      limit: cartItem.count,
      price: cartItem.price,
    };
  }
};

const groupingServerCartItems = (serverCartItems: ServerCartItemType[]): Record<string, ServerCartItemType> => {
  return serverCartItems.reduce((
    group: Record<string, ServerCartItemType>,
    item: ServerCartItemType) => {
    group[item.productId] = item;
    return group;
  }, {});
};

const getAllClientCartItems = (): Promise<ClientCartItemType[]> => {
  return IndexedDb.getAll(OBJECT_STORE_NAME.CARTS).then((items) => {
    clientCartItems.value = items;
    return items;
  });
};

const getAllServerCartItems = (): Promise<ServerCartItemType[]> => {
  return ProductService.post('products-in-cart', {
    query: {
      name: true,
      price: true,
      count: true,
      avatar: true
    },
    productIds: productIds.value,
  }).then((result) => {
    serverCartItemGroups.value = groupingServerCartItems(result.data);
    return result.data;
  });
};

const refreshProductInCart = (): void => {
  getAllServerCartItems().then((result) => {
    const promises = result.map((item) => {
      return IndexedDb.get(OBJECT_STORE_NAME.CARTS, item.productId)
        .then((product) => {
          if (product) {
            Object.assign(product, {
              name: item.name,
              avatar: item.avatar,
              limit: item.count,
              price: item.price,
            });
            IndexedDb.update(OBJECT_STORE_NAME.CARTS, product);
          }
        });
    });
    Promise.all(promises).then(getAllClientCartItems);
  });
};

onBeforeMount(() => SocketService.subscribe(SOCKET_EVENT_NAME.REFRESH, refreshProductInCart));

onBeforeUnmount(() => SocketService.unsubscribe(SOCKET_EVENT_NAME.REFRESH));

onMounted(() => {
  getAllClientCartItems()
    .then(getAllServerCartItems);
});
</script>
<style lang="scss">
.no-exist {
  &::after {
    content: '';
    position: absolute;
    background-color: v-bind(grayColor);
    opacity: .3;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
  }
}
</style>
