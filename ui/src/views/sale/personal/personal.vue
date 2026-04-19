<template>
  <section class="ps-h-100vh ps-display-flex ps-justify-content-center ps-align-items-center">
    <div class="ps-w-600px">
      <BackButton />
      <PersonalForm ref="personalForm" @onSubmit="onSubmit" class="ps-border-color-eb2f06 ps-bg-white">
        <template #default="{ onSubmit }">
          <el-button
          class="ps-w-100px
          ps-display-block
          ps-margin-auto
          ps-bg-eb2f06
          ps-text-color-white
          ps-fw-bold
          ps-border-none"
          @click="onSubmit">
            Save
          </el-button>
        </template>
      </PersonalForm>
    </div>
  </section>
</template>
<script lang="ts" setup>
import { useTemplateRef, onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import type { AxiosError, AxiosResponse } from 'axios';
import PersonalForm from '@/components/common/personal-form/personal-form.vue';
import BackButton from '@/components/common/buttons/back-button/back-button.vue';
import { UserService } from '@/services';
import useLogout from '@/composables/use-logout';;
import type { MessageResponseType, UserPersonalInfoType } from '@/interfaces';
import { showErrorNotification, showSuccessNotification } from '@/utils';
import { auth as authStore  } from '@/store';

const personalForm = useTemplateRef('personalForm');
const user = authStore.getUser() as UserPersonalInfoType;
const logout = useLogout();

const resetForm = (): void => {
  personalForm.value?.reset();
};

const onSubmit = (formData: FormData): void => {
  UserService.put('update-personal-info', formData)
    .then((response: AxiosResponse<MessageResponseType>) => {
      showSuccessNotification('Update your information!', response.data.messages);
      logout();
    }).catch((error: AxiosError<MessageResponseType>) => {
      showErrorNotification('Update your information!', error.response?.data.messages);
    })
    .finally(resetForm);
};


onMounted(() => {
  personalForm.value?.assignForm(user);
});

onBeforeRouteLeave(resetForm);
</script>
