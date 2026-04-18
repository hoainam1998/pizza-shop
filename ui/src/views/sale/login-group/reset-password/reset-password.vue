<template>
  <LoginFrame title="reset password" class="reset-password">
    <el-form
    :id="FORM_ID"
    ref="resetPasswordFormRef"
    :model="resetPasswordFormModel"
    :rules="resetPasswordFormRules"
    label-position="top">
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
      <el-button
      class="ps-display-block
      ps-margin-auto
      ps-fw-bold
      ps-w-150px
      ps-bg-black
      ps-text-color-white"
      :disabled="disableSubmit"
      @click="onSubmit">
        Save
      </el-button>
    </el-form>
  </LoginFrame>
</template>
<script setup lang="ts">
import { reactive } from 'vue';
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

const { push } = useWrapperRouter();
const FORM_ID = 'resetPasswordForm';
const { form, rules, resetForm, resetPasswordFormRef, disableSubmit } = useResetPasswordForm();
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
            showErrorNotification('Reset password', error.response?.data.messages);
          }).catch(resetForm);
      }
    });
  }
};

onBeforeRouteLeave(resetForm);
</script>
