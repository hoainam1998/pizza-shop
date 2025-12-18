<template>
  <div class="ps-px-10 ps-py-10">
    <div class="
      ps-mb-10
      ps-display-flex
      ps-flex-direction-mobile-column
      ps-flex-direction-tablet-column
      ps-flex-direction-large-tablet-column
      ps-flex-gap-10">
        <img :src="item.avatar" :alt="item.name"
          class="ps-w-40 ps-h-40 ps-margin-mobile-auto ps-margin-tablet-auto ps-margin-large-tablet-auto" />
        <div class="ps-w-100">
          <div class="ps-px-7">
            <h4 class="ps-mb-7 ps-text-truncate-2 ps-unselect ps-w-100">{{ item.name }}</h4>
            <span class="ps-display-flex
              ps-unselect
              ps-justify-content-desktop-space-between
              ps-justify-content-large-tablet-space-between
              ps-justify-content-tablet-space-between
              ps-align-items-desktop-center
              ps-flex-direction-mobile-column">
                <span class="ps-fw-bold">{{ $formatVNDCurrency(item.price) }}</span>
                <span class="ps-fs-13 ps-text-color-606266">Bought:&nbsp;{{ $replaceThousand(100) }}</span>
            </span>
          </div>
          <hr />
          <ul class="ps-px-0 ps-list-style-none">
            <li class="ps-display-inline ps-fs-14 ps-fw-bold">Ingredients:&nbsp;</li>
            <List :items="ingredients">
              <template #default="{ item }">
                <li class="ingredient-item ps-fs-13 ps-display-inline">{{ item }}</li>
              </template>
            </List>
          </ul>
        </div>
    </div>
    <el-button class="ps-bg-eb2f06
      ps-text-color-black
      ps-fw-bold
      ps-display-block
      ps-margin-auto
      ps-w-30
      ps-line-height-10">
        Add
    </el-button>
  </div>
</template>
<script setup lang="ts">
import List from '@/components/common/list.vue';
const { item } = defineProps<{
  item: {
    productId: string;
    name: string;
    avatar: string;
    price: number;
    bought: number;
    ingredients: string[];
  }
}>();

const ingredients = Array.apply(this, Array(20)).map(() => 'Lorem ipsum');
</script>
<style lang="scss" scoped>
.ingredient-item {
  &:not(:last-child) {
    &::after {
      content: ' - '
    }
  }
}
</style>
