<template>
  <img :src="cart.avatar" class="ps-w-60px ps-h-60px ps-mr-10" alt="product-cart" />
  <div class="ps-w-82">
    <h4 class="ps-text-truncate-2 ps-fs-14">
      {{ cart.name }}
    </h4>
    <div class="ps-display-flex ps-flex-gap-10 ps-mt-5">
      <div class="ps-display-flex ps-align-items-center">
        <button class="ps-cursor-pointer
          ps-border-none
          ps-border-radius-4
          ps-w-25px
          ps-h-25px"
          @click="amount.increase">
            <el-icon class="ps-pt-2" size="12"><Plus /></el-icon>
        </button>
        <div class="ps-w-60px ps-text-align-center">{{ amount.data }}</div>
        <button class="ps-cursor-pointer
          ps-border-none
          ps-border-radius-4
          ps-w-25px
          ps-h-25px"
          @click="amount.decrease">
            <el-icon class="ps-pt-2" size="12"><Minus /></el-icon>
        </button>
      </div>
      <span class="ps-display-flex
        ps-align-items-center
        ps-flex-gap-4
        ps-cursor-pointer
        ps-fw-bold
        ps-fs-12
        ps-text-color-f56c6c"
        @click="emit('delete')">
          <el-icon class="ps-pt-2"><Close /></el-icon>
          Delete
      </span>
    </div>
    <span v-if="amount.isExceeding" class="ps-fs-12 ps-text-color-f56c6c">
      Exceeding the available quantity!
    </span>
  </div>
  <DeleteDialog v-model="deleteDialogVisible" @confirm="emit('delete')" />
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Close, Plus, Minus } from '@element-plus/icons-vue';
import DeleteDialog from './delete-dialog.vue';

const deleteDialogVisible = ref<boolean>(false);

const showDeleteDialog = () => {
  deleteDialogVisible.value = true;
};

const emit = defineEmits<{
  (e: 'delete'): void;
  (e: 'calcTotal', quantity: number): void;
}>();

const { cart } = defineProps<{
  cart: {
    productId: string;
    name: string;
    avatar: string;
    limit: number;
    quantity: number;
    total: number;
    price: number;
  }
}>();

const amount = reactive({
  data: cart.quantity,
  isExceeding: false,
  increase() {
    if (this.data < cart.limit) {
      this.data += 1;
      emit('calcTotal', this.data);
    } else {
      this.isExceeding = true;
    }
  },
  decrease() {
    if (this.data > 1) {
      this.data -= 1;
      emit('calcTotal', this.data);
    } else {
      showDeleteDialog();
    }
  }
});
</script>
