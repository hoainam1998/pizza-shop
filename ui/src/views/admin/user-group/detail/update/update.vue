<template>
  <UserDetailForm ref="userFormRef" v-model="userDetailFormModel" :rules="userFormRules">
    <el-row :gutter="10">
      <el-col :xl="9">
        <el-form-item label="First name" prop="firstName">
          <el-input v-model="userDetailFormModel.firstName" name="firstName" />
        </el-form-item>
      </el-col>
      <el-col :xl="15">
        <el-form-item label="Last name" prop="lastName">
          <el-input v-model="userDetailFormModel.lastName" name="lastName" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col>
        <el-form-item label="Email" prop="email">
          <ps-email-input v-model="userDetailFormModel.email" name="email" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col>
        <el-form-item label="Phone" prop="phone">
          <el-input v-model="userDetailFormModel.phone" name="phone" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xl="12">
        <el-form-item label="Sex" prop="sex">
          <el-radio-group v-model="userDetailFormModel.sex" name="sex">
            <el-radio label="Male" :value="0" />
            <el-radio label="Female" :value="1" />
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>
    <slot />
  </UserDetailForm>
</template>
<script setup lang="ts">
import { reactive, useTemplateRef } from 'vue';
import type { AxiosError, AxiosResponse } from 'axios';
import type { FormInstance, FormRules } from 'element-plus';
import UserDetailForm from '@/components/admin/user-detail-form/user-detail-form.vue';
import PsEmailInput from '@/components/common/inputs/email/email.vue';
import { useUserForm } from '@/composables';
import type { MessageResponseType, UserDetailModelType, UserDetailExposeType, UserFormExposeType } from '@/interfaces';
import { UserService } from '@/services';
import { showErrorNotification, showSuccessNotification } from '@/utils';
import { cookie as cookieStore } from '@/store';

const userFormRef = useTemplateRef<UserDetailExposeType>('userFormRef');
const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'closeDialog'): void;
}>();

const { model, rules, resetForm } = useUserForm();
const userDetailFormModel = reactive<UserDetailModelType>(model);
const userFormRules = reactive<FormRules<UserDetailModelType>>(rules);

const reset = (): void => {
  (userFormRef.value?.formInstance as FormInstance).resetFields();
  resetForm();
};

const assignForm = (data: UserDetailModelType): void => {
  userDetailFormModel.apiKey= data.apiKey!;
  userDetailFormModel.userId = data.userId;
  userDetailFormModel.firstName = data.firstName;
  userDetailFormModel.lastName = data.lastName;
  userDetailFormModel.email = data.email;
  userDetailFormModel.phone = data.phone;
  userDetailFormModel.sex = data.sex;
};

const closeDialog = (): void => {
  emit('closeDialog');
};

const onSubmit = (): void => {
  userFormRef.value?.validate()
    .then(() => {
      const userData: Partial<typeof userDetailFormModel> = { ...userDetailFormModel };
      cookieStore.setImpactUserApiKey(userData.apiKey!);
      delete userData.apiKey;
      UserService.put('update', userData).then((response: AxiosResponse<MessageResponseType>) => {
        showSuccessNotification('Update user!', response.data.messages);
        emit('refresh');
      }).catch((error: AxiosError<MessageResponseType>) => {
        showErrorNotification('Update user!', error.response?.data.messages);
      })
      .finally(closeDialog);
    }).catch(() => {});
};

defineExpose<UserFormExposeType>({
  assignForm,
  onSubmit,
  reset,
});
</script>
