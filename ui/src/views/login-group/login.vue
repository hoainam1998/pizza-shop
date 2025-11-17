<template>
  <LoginFrame title="login" class="login">
    <template #default>
      <img :src="require('@/assets/images/logo.png')"
        class="ps-display-block ps-margin-auto"
        width="100px"
        height="100px" />
      <el-form :id="FORM_ID" ref="loginFormRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" type="mail" name="email" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="form.password" name="password" autocomplete="off" />
        </el-form-item>
        <el-button class="ps-display-block ps-margin-auto ps-fw-bold ps-w-150px" type="primary" @click="onSubmit">
          Save
        </el-button>
      </el-form>
    </template>
  </LoginFrame>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import LoginFrame from './login-frame.vue';
import constants from '@/constants';

type LoginFormType = {
  email: string;
  password: string;
};

const FORM_ID = 'loginForm';
const loginFormRef = ref<FormInstance>();

const rules = reactive<FormRules<LoginFormType>>({
  email: [
    {
      required: true, message: 'Email is required!', trigger: 'change',
    },
    {
      type: 'email', message: 'Email is invalid!', trigger: 'change',
    }
  ],
  password: [
    {
      required: true, message: 'Password is required!', trigger: 'change',
    },
    {
      pattern: constants.PASSWORD_PATTERN, message: 'Password is invalid!', trigger: 'change',
    }
  ]
});

const form = reactive<LoginFormType>({
  email: '',
  password: '',
});

const onSubmit = async (): Promise<void> => {
  if (loginFormRef.value) {
    await loginFormRef.value.validate((valid) => {
      if (valid) {
        // TODO
      }
    });
  }
};

const resetForm = (): void => {
  loginFormRef.value?.resetFields();
};

onBeforeRouteLeave(resetForm);
</script>
<style lang="scss" scoped>
.login-box {
  box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
}
</style>
