<template>
  <section class="login ps-display-flex ps-justify-content-center ps-align-items-center ps-h-100">
    <div class="ps-bg-f39c12 ps-border-radius-5">
      <h4 class="ps-text-color-white ps-text-transform-uppercase ps-py-3 ps-px-7">login form</h4>
      <div class="login-box ps-w-400px ps-border-radius-5 ps-bg-white ps-px-10 ps-py-10">
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
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, useTemplateRef } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import type { FormRules } from 'element-plus';

type LoginFormType = {
  email: string;
  password: string;
};

const FORM_ID = 'loginForm';
const loginFormRef = useTemplateRef('loginFormRef');

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
      pattern: /[A-Za-z0-9@$#%!^&*()]{8}/, message: 'Password is invalid!', trigger: 'change',
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
      // TODO
    });
  }
};

const resetForm = (): void => {
  loginFormRef.value.resetFields();
};

onBeforeRouteLeave(resetForm);
</script>
<style lang="scss" scoped>
  .login-box {
    box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
  }
</style>
