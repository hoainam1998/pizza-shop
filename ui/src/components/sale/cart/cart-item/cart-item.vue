<template>
  <div class="ps-display-flex ps-position-relative ps-px-7 ps-py-7" :class="{ 'ps-unselect no-exist': cart.noExist }">
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
            :disabled="!cart.noExist && cart.isDisable || cart.isFresh"
            @click="amount.increase">
            <el-icon class="ps-pt-2" size="12">
              <Plus />
            </el-icon>
          </button>
          <div class="ps-w-60px ps-text-align-center ps-unselect">{{ amount.data }}</div>
          <button class="ps-cursor-pointer
            ps-border-none
            ps-border-radius-4
            ps-w-25px
            ps-h-25px"
            :disabled="!cart.noExist && cart.isDisable || cart.isFresh"
            @click="amount.decrease">
            <el-icon class="ps-pt-2" size="12">
              <Minus />
            </el-icon>
          </button>
        </div>
        <div class="ps-display-flex ps-align-items-center ps-flex-gap-10">
          <span v-if="!cart.noExist" class="ps-display-flex
            ps-align-items-center
            ps-flex-gap-4
            ps-cursor-pointer
            ps-fw-bold
            ps-fs-12
            ps-text-color-f56c6c"
            @click="emit('delete')">
            <el-icon class="ps-pt-2">
              <Close />
            </el-icon>
            Delete
          </span>
          <span v-if="cart.isFresh" class="ps-display-flex
            ps-align-items-center
            ps-flex-gap-4
            ps-cursor-pointer
            ps-fw-bold
            ps-fs-12
            ps-text-color-00a8ff"
            @click="emit('fresh')">
            <el-icon class="ps-pt-2">
              <Refresh />
            </el-icon>
            Refresh
          </span>
        </div>
      </div>
      <span v-if="amount.isExceeding" class="ps-fs-12 ps-text-color-f56c6c">
        Exceeding the available quantity!
      </span>
    </div>
    <button v-if="cart.noExist" class="ps-position-absolute
      ps-z-index-plus
      ps-cursor-pointer
      ps-right-5px
      ps-bg-eb2f06
      ps-border-none
      ps-border-radius-4"
      @click="emit('delete')">
      <el-icon class="ps-pt-5" color="white" size="14">
        <Close />
      </el-icon>
    </button>
  </div>
  <ul v-if="cart.messages.length && cart.isDisable === false"
    class="ps-list-style-none ps-px-10 ps-mb-7">
    <List :items="cart.messages">
      <template #default="{ item }">
        <li class="error-item ps-fs-12 ps-text-color-f56c6c ps-text-truncate-2">{{ item }}</li>
      </template >
    </List>
  </ul>
  <DeleteDialog v-model="deleteDialogVisible" @confirm="emit('delete')" />
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Close, Plus, Minus, Refresh } from '@element-plus/icons-vue';
import List from '@/components/common/list/list.vue';
import DeleteDialog from '../delete-dialog.vue';
import type { CartItemPropsType } from './props-validator';

const deleteDialogVisible = ref<boolean>(false);

const showDeleteDialog = () => deleteDialogVisible.value = true;

const emit = defineEmits<{
  (e: 'delete'): void;
  (e: 'fresh'): void;
  (e: 'calcTotal', quantity: number): void;
}>();

const { cart } = defineProps<CartItemPropsType>();

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
