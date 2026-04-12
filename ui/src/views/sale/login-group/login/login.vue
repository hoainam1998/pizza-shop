<template>
  <LoginFrame title="Login">
    <el-form :id="FORM_ID" ref="loginFormRef" :model="loginFormModel" :rules="loginFormRules" label-position="top">
      <el-form-item label="Email" prop="email">
        <ps-email-input v-model="loginFormModel.email" name="email" />
      </el-form-item>
      <el-form-item label="Password" prop="password">
        <ps-password-input v-model="loginFormModel.password" name="password" />
      </el-form-item>
      <el-button class="ps-display-block
        ps-margin-auto
        ps-fw-bold
        ps-w-150px
        ps-bg-black
        ps-text-color-white"
        @click="onSubmit">
        Save
      </el-button>
    </el-form>
  </LoginFrame>
</template>
<script lang="ts" setup>
import { reactive } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import LoginFrame from '@/components/common/login-frame/login-frame.vue';
import PsPasswordInput from '@/components/common/inputs/password.vue';
import PsEmailInput from '@/components/common/inputs/email.vue';
import loginFormInformation from '@/composables/use-login-form';

const FORM_ID = 'loginForm';
const { rules, form, loginFormRef, resetForm } = loginFormInformation;
const loginFormRules = reactive<typeof rules>(rules);
const loginFormModel = reactive<typeof form>(form);

const onSubmit = async (): Promise<void> => {
  if (loginFormRef.value) {
    await loginFormRef.value.validate((valid) => {
      if (valid) {}
    });
  }
};

onBeforeRouteLeave(resetForm);
</script>
