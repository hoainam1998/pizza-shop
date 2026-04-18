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
import type { AxiosError, AxiosResponse } from 'axios';
import LoginFrame from '@/components/common/login-frame/login-frame.vue';
import PsPasswordInput from '@/components/common/inputs/password/password.vue';
import PsEmailInput from '@/components/common/inputs/email/email.vue';
import loginFormInformation from '@/composables/use-login-form';
import useWrapperRouter from '@/composables/use-router';
import { UserService } from '@/services';
import paths from '@/router/paths';
import { auth as authStore } from '@/store';
import { generateResetPasswordLink, showErrorNotification } from '@/utils';
import type { LoginResponseType, MessageResponseType } from '@/interfaces';

const { push } = useWrapperRouter();
const FORM_ID = 'loginForm';
const { rules, form, loginFormRef, resetForm } = loginFormInformation;
const loginFormRules = reactive<typeof rules>(rules);
const loginFormModel = reactive<typeof form>(form);

const onSubmit = async (): Promise<void> => {
  if (loginFormRef.value) {
    await loginFormRef.value.validate((valid) => {
      if (valid) {
        UserService.post('login', form)
          .then((response: AxiosResponse<LoginResponseType>) => {
            if (response.data.isFirstTime) {
              push(generateResetPasswordLink(response.data.resetPasswordToken));
            } else {
              authStore.setUserLoggedToken(response.data.userLoggedToken);
              authStore.setApiKey(response.data.apiKey!);
              push(paths.HOME);
            }
          }).catch((error: AxiosError<MessageResponseType>) => {
            showErrorNotification('Admin login!', error.response?.data.messages);
          });
      }
    });
  }
};

onBeforeRouteLeave(resetForm);
</script>
