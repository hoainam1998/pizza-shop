<template>
  <LoginFrame title="login" class="login">
    <template #default>
      <img :src="require('@/assets/images/logo.png')"
        class="ps-display-block ps-margin-auto"
        width="100px"
        height="100px" />
      <el-form :id="FORM_ID" ref="loginFormRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="Email" prop="email">
          <ps-email-input v-model="form.email" name="email" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <ps-password-input v-model="form.password" name="password" />
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
import type { FormInstance, FormRules } from 'element-plus';
import LoginFrame from './common/login-frame.vue';
import PsPasswordInput from '@/components/inputs/password.vue';
import PsEmailInput from '@/components/inputs/email.vue';
import constants from '@/constants';
import paths from '@/router/paths';
import {auth as authStore } from '@/composables/store';
import useWrapperRouter from '@/composables/use-router';
import { UserService } from '@/services';
import { generateResetPasswordLink, showErrorNotification } from '@/utils';
import type { LoginResponseType, MessageResponseType } from '@/interfaces';

type LoginFormType = {
  email: string;
  password: string;
};

const { push } = useWrapperRouter();
const FORM_ID = 'loginForm';
const loginFormRef = ref<FormInstance>();
const canSignup = ref<boolean>();

const rules = reactive<FormRules<LoginFormType>>({
  email: [
    {
      required: true, message: 'Email is required!', trigger: 'change',
    },
    {
      type: 'email', message: 'Email is invalid!', trigger: 'blur',
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
        UserService.post('login', form)
          .then((response: AxiosResponse<LoginResponseType>) => {
            if (response.data.isFirstTime) {
              push(generateResetPasswordLink(response.data.resetPasswordToken));
            } else {
              authStore.setAlreadyLogin(true);
              push(`${paths.HOME}`);
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
  UserService.get('can-signup').then((response) => {
    canSignup.value = response.data.canSignup;
  }).catch(() => {
    canSignup.value = false;
  });
});

onBeforeRouteLeave(resetForm);
</script>
<style lang="scss" scoped>
.login-box {
  box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
}
</style>
