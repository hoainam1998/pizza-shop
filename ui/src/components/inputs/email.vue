<template>
  <el-input v-model="model" v-bind="attrs" @blur="onCompleteInput">
    <template #append>
      <el-select
        v-model="select"
        placeholder="Select email domain!"
        class="ps-fs-14"
        style="width: 100px"
        @change="onCompleteInput">
          <el-option v-for="([key, value]) in emailDomains" :key="key" :label="key" :value="value" />
      </el-select>
    </template>
  </el-input>
</template>
<script setup lang="ts">
import { defineModel, ref, useAttrs } from 'vue';
import { EMAIL_DOMAIN } from '@/enums';

defineOptions({
  inheritAttrs: false,
});
const emailDomains = Object.entries(EMAIL_DOMAIN);
const model = defineModel<string>({ default: '' });
const select = ref<string>(EMAIL_DOMAIN.GMAIL);

const attrsFallThrough = useAttrs();
const attrs = Object.assign({ ...attrsFallThrough }, { type: 'email', autocomplete: 'off' });

const onCompleteInput = (): void => {
  const pattern = /@(\w|\.)+/;
  if (pattern.test(model.value)) {
    model.value = model.value.replace(pattern, select.value);
  } else {
    model.value = `${model.value}${select.value}`;
  }
};
</script>
