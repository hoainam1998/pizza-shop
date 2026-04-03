<template>
  <section class="ps-py-10 ps-py-10 ps-px-10 ps-bg-transparent">
    <BackButton>Home</BackButton>
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
                <CartItem :cart="item" @delete="item.delete" @fresh="item.fresh" @calcTotal="item.calcTotal" />
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
                <li>
                  <BillItem :cart="item" />
                </li>
              </template>
            </List>
          </ul>
          <div class="ps-display-flex ps-mt-10 ps-justify-content-space-between ps-align-items-center">
            <span>
              <span class="ps-fw-bold">Total:&nbsp;</span>
              <span class="ps-text-style-italic">{{ $formatVNDCurrency(total) }}</span>
            </span>
            <el-button :disabled="cartItems.length === 0" type="primary" class="ps-w-mobile-100px" @click="payment">
              Payment
            </el-button>
          </div>
          <span v-if="totalConflictMessage?.trim()" class="error-item ps-text-color-f56c6c ps-fs-13">
            {{ totalConflictMessage }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue';
import CartItem from '@/components/sale/cart/cart-item/cart-item.vue';
import BillItem from '@/components/sale/cart/bill-item.vue';
import List from '@/components/common/list.vue';
import BackButton from '@/components/common/buttons/back-button/back-button.vue';
import SocketService from '@/socket';
import IndexedDb from '@/indexed-db';
import { OBJECT_STORE_NAME, SOCKET_EVENT_NAME, ERROR_PRODUCT_STATE } from '@/enums';
import { ProductService } from '@/services';
import { useProductsInCart } from '@/composables';
import { grayColor } from '@/assets/scss/variables.module.scss';
import { type ClientCartItemType } from '@/interfaces';
import { showSuccessNotification } from '@/utils';
import type { CartItemInfoType } from '@/components/sale/cart/cart-item/props-validator';

type ServerCartItemType = {
  productId: string;
  name: string;
  avatar: string;
  count: number;
  price: number;
};

type ErrorCartItemType = {
  productId: string;
  errorCode: string;
  messages: string[];
};

type ClientErrorCartItemType = {
  isFresh?: boolean;
  isDisable?: boolean;
  messages: string[];
};

type NeededCartItemType = Omit<ClientCartItemType, 'productId' | 'quantity' | 'total'>;

type BillItemType = Pick<ClientCartItemType, 'productId' | 'price' | 'quantity' | 'total'>;

type PaymentErrorType = {
  errors: ErrorCartItemType[];
  totalErrorMessage: string | null;
  validateResult: boolean;
};

const cart = useProductsInCart();
const clientCartItems = ref<ClientCartItemType[]>([]);
const serverCartItemGroups = ref<Record<string, ServerCartItemType>>({});
const clientErrorCartItemGroups = ref<Record<string, ClientErrorCartItemType>>({});
const totalConflictMessage = ref<string | null>(null);

const total = computed<number>(() => {
  return cartItems.value.reduce((count, cart) => {
    if (!cart.noExist) {
      count += cart.total;
    }
    return count;
  }, 0);
});

const cartItems = computed<CartItemInfoType[]>(() => {
  return (clientCartItems.value || []).map((cartItem) => {
    const serverCartItem = serverCartItemGroups.value[cartItem.productId as keyof typeof serverCartItemGroups.value];
    const errorCartItem =
      clientErrorCartItemGroups.value[cartItem.productId as keyof Record<string, ClientErrorCartItemType>];
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
      isFresh: errorCartItem?.isFresh,
      isDisable: errorCartItem?.isDisable,
      messages: errorCartItem?.messages || [],
      fresh: fresh(cartItem.productId, cartItem),
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

const groupingServerCartItem = (group: Record<string, ServerCartItemType>, serverCartItem: ServerCartItemType)
  : Record<string, ServerCartItemType> => {
  return Object.assign(group, { [serverCartItem.productId]: serverCartItem });
};

const groupingServerCartItems = (serverCartItems: ServerCartItemType[]): Record<string, ServerCartItemType> => {
  return serverCartItems.reduce((
    group: Record<string, ServerCartItemType>,
    item: ServerCartItemType) => {
    return groupingServerCartItem(group, item);
  }, {});
};

const groupingErrorCartItems = (errorCartItems: ErrorCartItemType[]):
  Record<string, ClientErrorCartItemType> => {
  return errorCartItems.reduce((
    group: Record<string, ClientErrorCartItemType>,
    item: ErrorCartItemType) => {
    group[item.productId] = {
      isFresh: item.errorCode === ERROR_PRODUCT_STATE.REFRESH_PRODUCT,
      isDisable: item.errorCode === ERROR_PRODUCT_STATE.DISABLED_PRODUCT,
      messages: item.messages,
    };
    return group;
  }, {});
};

const handleErrorsAfterValidate = (paymentError: PaymentErrorType): void => {
  if (!paymentError.validateResult) {
    clientErrorCartItemGroups.value = groupingErrorCartItems(paymentError.errors);
  } else {
    clientErrorCartItemGroups.value = {};
  }
  totalConflictMessage.value = paymentError.totalErrorMessage;
};

const getAllClientCartItems = (): Promise<ClientCartItemType[]> => {
  return IndexedDb.getAll(OBJECT_STORE_NAME.CARTS).then((items) => {
    clientCartItems.value = items;
    return items;
  });
};

const getAllServerCartItems = (): Promise<ServerCartItemType[]> => {
  if (productIds.value.length) {
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
  }

  return Promise.resolve([]);
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

const getCartItemForBill = (): Promise<BillItemType[]> => {
  return IndexedDb.getAll(OBJECT_STORE_NAME.CARTS)
    .then((carts) => {
      return carts.reduce((items, cart, index) => {
        items.push({
          productId: cart.productId,
          price: cart.price,
          quantity: cart.quantity,
          total: cartItems.value[index].total,
        });
        return items;
      }, []);
    });
};

const validateProductsInCart = (items: BillItemType[]): void => {
  ProductService.post('validate-products-in-cart', { carts: items, total: total.value })
    .then((response) => {
      const paymentError = response.data;
      handleErrorsAfterValidate(paymentError);
    });
};

const fresh = (productId: string, old: ClientCartItemType) => (): void => {
  ProductService.post('detail', {
    productId,
    query: {
      name: true,
      avatar: true,
      price: true,
      count: true,
    },
  }).then((response) => {
    const product = response.data;
    serverCartItemGroups.value = groupingServerCartItem(serverCartItemGroups.value, product);
    const updateProduct = {
      ...old, name: product.name,
      avatar: product.avatar,
      limit: product.count,
      price: product.price,
      quantity: old.quantity > product.count ? product.count : old.quantity,
    };
    IndexedDb.update(OBJECT_STORE_NAME.CARTS, updateProduct)
      .then(() => {
        getAllClientCartItems()
          .then(() => {
            getCartItemForBill().then(validateProductsInCart);
          });
      });
  });
};

const payment = (): void => {
  getCartItemForBill()
    .then((items) => {
      ProductService.post('payment', { carts: items, total: total.value })
        .then((response) => {
          showSuccessNotification('Pay success', response.data.messages);
          IndexedDb.clear(OBJECT_STORE_NAME.CARTS)
            .then(getAllClientCartItems);
        })
        .catch((error) => {
          const paymentError = error.response.data;
          handleErrorsAfterValidate(paymentError);
        });
    });
};

onBeforeMount(() => SocketService.subscribe(SOCKET_EVENT_NAME.REFRESH, refreshProductInCart));

onBeforeUnmount(() => SocketService.unsubscribe(SOCKET_EVENT_NAME.REFRESH));

onMounted(() => {
  getAllClientCartItems()
    .then(getAllServerCartItems)
    .catch(() => {});
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

.error-item {
  &:before {
    content: '* ';
  }
}
</style>
