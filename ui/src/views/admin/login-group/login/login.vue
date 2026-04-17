<template>
  <LoginFrame title="login" class="login">
    <template #default>
      <img :src="require('@/assets/images/logo.png')"
        class="ps-display-block ps-margin-auto"
        width="100px"
        height="100px" />
      <el-form :id="FORM_ID" ref="loginFormRef" :model="loginFormModel" :rules="loginFormRules" label-position="top">
        <el-form-item label="Email" prop="email">
          <ps-email-input v-model="loginFormModel.email" name="email" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <ps-password-input v-model="loginFormModel.password" name="password" />
        </el-form-item>
        <div class="ps-text-align-end">
          <RouterLink v-if="canSignup"
            class="ps-fs-14 ps-text-decorator-none ps-text-color-00a8ff"
            :to="paths.SIGNUP.Path">
              Signup
          </RouterLink>
        </div>
        <el-button class="ps-display-block ps-margin-auto ps-fw-bold ps-w-150px" type="primary" @click="onSubmit">
          Save
        </el-button>
      </el-form>
    </template>
  </LoginFrame>
</template>
<script setup lang="ts">
import { reactive, ref, onBeforeMount } from 'vue';
import { onBeforeRouteLeave, RouterLink } from 'vue-router';
import type { AxiosError, AxiosResponse } from 'axios';
import LoginFrame from '@/components/common/login-frame/login-frame.vue';
import PsPasswordInput from '@/components/common/inputs/password.vue';
import PsEmailInput from '@/components/common/inputs/email.vue';
import paths from '@/router/paths';
import { auth as authStore } from '@/store';
import useWrapperRouter from '@/composables/use-router';
import loginFormInformation from '@/composables/use-login-form';
import { UserService } from '@/services';
import { generateResetPasswordLink, showErrorNotification } from '@/utils';
import type { LoginResponseType, MessageResponseType } from '@/interfaces';

const { push } = useWrapperRouter();
const FORM_ID = 'loginForm';
const canSignup = ref<boolean>();
const { rules, form, loginFormRef } = loginFormInformation;
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
              push(`${paths.HOME}/${paths.HOME.CATEGORY}`);
            }
          }).catch((error: AxiosError<MessageResponseType>) => {
            showErrorNotification('Admin login!', error.response?.data.messages);
          });
      }
    });
  }
};

const resetForm = (): void => {
  loginFormRef.value?.resetFields();
};

onBeforeMount(() => {
  UserService.get('can-signup')
    .then((response) => canSignup.value = response.data.canSignup)
    .catch(() => canSignup.value = false);
});

onBeforeRouteLeave(resetForm);
</script>
