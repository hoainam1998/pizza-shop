<template>
  <el-form ref="userDetailFormRef" :model="model" label-width="auto" :rules="rules" class="ps-bg-white">
    <slot />
  </el-form>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import constants from '@/constants';
import type { UserDetailModelType, UserDetailExposeType } from '@/interfaces';

const model = defineModel<UserDetailModelType>({ default: {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  sex: constants.SEX.MALE,
}});

const userDetailFormRef = ref<FormInstance>();

const { rules } = defineProps<{
  rules: FormRules<UserDetailModelType>,
}>();

const validate = async (): Promise<boolean> => {
  if (userDetailFormRef.value) {
    return userDetailFormRef.value.validate();
  }
  return Promise.reject(new Error('Form ref is not valid!'));
};

defineExpose<UserDetailExposeType>({
  validate,
  reset: () => userDetailFormRef.value?.resetFields(),
});
</script>