<template>
  <div class="ps-display-flex ps-flex-gap-7 ps-align-items-center">
    <el-input
      v-model="keyword"
      @keydown="enterPress"
      @input="canReset = false"
      class="ps-w-300px ps-fs-13"
      placeholder="Enter your keyword!">
      <template #append>
        <el-button v-if="canReset" :icon="Close" @click="reset" />
        <el-button v-else :icon="Search" @click="search" />
      </template>
    </el-input>
    <span
      v-if="resultObj.showResult"
      class="ps-text-color-606266 ps-fs-13">
      Show result for: {{ resultObj.result }}
    </span>
  </div>
</template>
<script setup lang="ts">
import { type ModelRef, type Ref, defineModel, defineEmits, ref, reactive, nextTick } from 'vue';
import { Search, Close } from '@element-plus/icons-vue';

const keyword: ModelRef<string> = defineModel({ required: true });
const canReset: Ref<boolean> = ref(false);
const resultObj = reactive({
  showResult: false,
  result: '',
  reset() {
    this.showResult = false;
    this.result = '';
  },
});

const emit = defineEmits<{
  (e: 'search', keyword: string): void;
}>();

const enterPress = (event: KeyboardEvent): void => {
  if (event.code === 'Enter') {
    search();
  }
};

const reset = (): void => {
  canReset.value = false;
  keyword.value = '';
  resultObj.reset();
  nextTick(() => emit('search', keyword.value));
};

const search = (): void => {
  emit('search', keyword.value);
  canReset.value = true;
  resultObj.result = keyword.value;
  resultObj.showResult = true;
};
</script>