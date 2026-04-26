<template>
  <el-dialog
  v-model="dialogVisible"
  width="35%"
  align-center
  @close="reset"
  center
  header-class="ps-mb-10"
  footer-class="ps-pt-0">
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
        <el-col :xl="12">
          <el-form-item label="Power" prop="power">
            <el-radio-group v-model="userDetailFormModel.power" name="power">
              <el-radio label="Admin" :value="POWER.ADMIN" />
              <el-radio label="Sale" :value="POWER.SALE" />
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <slot />
    </UserDetailForm>
    <template #footer>
      <el-button class="ps-w-100px" type="success" @click="onSubmit">Save</el-button>
      <el-button class="ps-w-100px" type="warning" @click="closeDialog">Close</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { reactive, useTemplateRef } from 'vue';
import type { AxiosError, AxiosResponse } from 'axios';
import { POWER } from '@/enums';
import type { FormInstance, FormRules } from 'element-plus';
import UserDetailForm from '@/components/admin/user-detail-form/user-detail-form.vue';
import PsEmailInput from '@/components/common/inputs/email/email.vue';
import { useUserForm } from '@/composables';
import type { MessageResponseType, UserDetailModelType, UserDetailExposeType } from '@/interfaces';
import { UserService } from '@/services';
import { showErrorNotification, showSuccessNotification } from '@/utils';
import { cookie as cookieStore } from '@/store';

type UserFormExposeType = {
  assignForm: (data: UserDetailModelType) => void;
};

const userFormRef = useTemplateRef<UserDetailExposeType>('userFormRef');
let userApiKey: string;
const dialogVisible = defineModel<boolean>();
const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const { model, rules, resetForm } = useUserForm({
  model: {
    power: POWER.SALE,
  },
  rules: {
    power: [
      {
        required: true, message: 'Power is required!', trigger: 'change',
      },
    ],
  },
});

const userDetailFormModel = reactive<UserDetailModelType>(model);
const userFormRules = reactive<FormRules<UserDetailModelType>>(rules);

const reset = (): void => {
  (userFormRef.value?.formInstance as FormInstance).resetFields();
  resetForm();
};

const assignForm = (data: UserDetailModelType): void => {
  userApiKey = data.apiKey;
  userDetailFormModel.userId = data.userId;
  userDetailFormModel.firstName = data.firstName;
  userDetailFormModel.lastName = data.lastName;
  userDetailFormModel.email = data.email;
  userDetailFormModel.phone = data.phone;
  userDetailFormModel.sex = data.sex;
};

const closeDialog = () => dialogVisible.value = false;

const onSubmit = (): void => {
  userFormRef.value?.validate()
    .then(() => {
      let promiseResult: Promise<AxiosResponse<MessageResponseType>>;
      let toastTitle: string;

      if (userDetailFormModel.userId) {
        cookieStore.setImpactUserApiKey(userApiKey);
        toastTitle = 'Update user!';
        promiseResult = UserService.put('update', userDetailFormModel);
      } else {
        const userData = { ...userDetailFormModel };
        delete userData.userId;
        toastTitle = 'Create user!';
        promiseResult = UserService.post('create', userData);
      }

      promiseResult
        .then((response: AxiosResponse<MessageResponseType>) => {
          showSuccessNotification(toastTitle, response.data.messages);
          emit('refresh');
        })
        .catch((error: AxiosError<MessageResponseType>) => {
          showErrorNotification(toastTitle, error.response?.data.messages);
        })
        .finally(closeDialog);
    }
    ).catch(() => {});
};

defineExpose<UserFormExposeType>({
  assignForm
});
</script>
