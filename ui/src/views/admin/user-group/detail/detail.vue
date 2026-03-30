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
import { POWER } from '@/enums';
import type { FormInstance, FormRules } from 'element-plus';
import UserDetailForm from '@/components/admin/user-detail-form/user-detail-form.vue';
import PsEmailInput from '@/components/inputs/email.vue';
import { useUserForm } from '@/composables';
import type { MessageResponseType, UserDetailModelType, UserDetailExposeType } from '@/interfaces';
import { UserService } from '@/services';
import type { AxiosError, AxiosResponse } from 'axios';
import { showErrorNotification, showSuccessNotification } from '@/utils';

const userFormRef = useTemplateRef<UserDetailExposeType>('userFormRef');
const dialogVisible = defineModel<boolean>();

const { model, rules } = useUserForm({
  model: {
    power: POWER.SALE,
  },
  rules: {
    power: [
      {
        required: true, message: 'Power is required!', trigger: 'change',
      }
    ]
  },
});

const userDetailFormModel = reactive<UserDetailModelType>(model);
const userFormRules = reactive<FormRules<UserDetailModelType>>(rules);

const reset = (): void => {
  if (userFormRef.value?.formInstance) {
    (userFormRef.value?.formInstance as FormInstance).resetFields();
    (userFormRef.value?.formInstance as FormInstance).clearValidate();
  }
};

const closeDialog = (): void => {
  dialogVisible.value = false;
};

const onSubmit = (): void => {
  userFormRef.value?.validate()
    .then(() => {
      UserService.post('create', userDetailFormModel)
        .then((response: AxiosResponse<MessageResponseType>) => {
          showSuccessNotification('Create user', response.data.messages);
        })
        .catch((error: AxiosError<MessageResponseType>) => {
          showErrorNotification('Create user', error.response?.data.messages);
        }).finally(closeDialog);
    }
    ).catch(() => {});
};
</script>
