<template>
  <LoginFrame title="reset password" class="reset-password">
    <el-form
    :id="FORM_ID"
    ref="resetPasswordFormRef"
    :model="resetPasswordFormModel"
    :rules="resetPasswordFormRules"
    label-position="top"
    class="ps-w-400px">
      <el-form-item label="Email" prop="email" class="ps-mb-12">
        <ps-email-input v-model="resetPasswordFormModel.email" name="email" />
      </el-form-item>
      <el-form-item label="Old password" prop="oldPassword" class="ps-mb-12">
        <ps-password-input v-model="resetPasswordFormModel.oldPassword" name="oldPassword" />
      </el-form-item>
      <el-form-item label="Password" prop="password" class="ps-mb-12">
        <ps-password-input v-model="resetPasswordFormModel.password" name="password" />
      </el-form-item>
      <el-form-item label="Confirm password" prop="confirmPassword">
        <ps-password-input v-model="resetPasswordFormModel.confirmPassword" name="confirmPassword" />
      </el-form-item>
      <slot :disabled="disableSubmit" :submit="onSubmit" />
      <div v-if="canRefreshToken" class="ps-display-flex ps-justify-content-right ps-mt-7 ps-cursor-pointer">
        <span class="ps-fs-14 ps-text-color-00a8ff ps-text-decorator-underline" @click="refreshResetPasswordToken">
          Refresh token?
        </span>
      </div>
    </el-form>
  </LoginFrame>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import type { AxiosError, AxiosResponse } from 'axios';
import LoginFrame from '@/components/common/login-frame/login-frame.vue';
import PsPasswordInput from '@/components/common/inputs/password/password.vue';
import PsEmailInput from '@/components/common/inputs/email/email.vue';
import useResetPasswordForm from '@/composables/use-reset-password-form';
import useWrapperRouter from '@/composables/use-router';
import paths from '@/router/paths';
import { UserService } from '@/services';
import { showErrorNotification, showSuccessNotification } from '@/utils';
import type { MessageResponseType } from '@/interfaces';
import { ERROR_CODE } from '@/enums';

const { push } = useWrapperRouter();
const FORM_ID = 'resetPasswordForm';
const { form, rules, resetForm, resetPasswordFormRef, disableSubmit } = useResetPasswordForm();
const canRefreshToken = ref<boolean>(false);
const resetPasswordFormModel = reactive<typeof form>(form);
const resetPasswordFormRules = reactive<typeof rules>(rules);

const onSubmit = async (): Promise<void> => {
  if (resetPasswordFormRef.value) {
    await resetPasswordFormRef.value.validate((valid) => {
      if (valid) {
        const resetPasswordPayload = { ...resetPasswordFormModel };
        delete resetPasswordPayload.confirmPassword;
        UserService.post('reset-password', resetPasswordPayload)
          .then((response: AxiosResponse<MessageResponseType>) => {
            showSuccessNotification('Reset password', response.data.messages);
            push(paths.LOGIN);
          }).catch((error: AxiosError<MessageResponseType>) => {
            if (error.response?.data.errorCode === ERROR_CODE.TOKEN_EXPIRED) {
              canRefreshToken.value = true;
            }
            showErrorNotification('Reset password', error.response?.data.messages);
          }).catch(resetForm);
      }
    });
  }
};

const refreshResetPasswordToken = (): void => {
  UserService.post('refresh-reset-password-token', { token: resetPasswordFormModel.token })
    .then(() => {
      canRefreshToken.value = false;
      push(paths.LOGIN);
    })
    .catch((error: AxiosError<MessageResponseType>) => {
      showErrorNotification('Refresh reset password token!', error.response?.data.messages);
    });
};

onBeforeRouteLeave(resetForm);
</script>
