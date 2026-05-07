<template>
  <UserDetailView
    v-model="dialogVisible"
    @resetForm="userFormEmit.reset"
    @onSubmit="userFormEmit.onSubmit"
    @closeDialog="closeDialog">
    <component :is="component" ref="userFormRef" @refresh="search" @closeDialog="closeDialog" />
  </UserDetailView>
</template>
<script setup lang="ts">
import { ref, computed, useTemplateRef, nextTick, reactive } from 'vue';
import UserDetailView from '@/components/admin/user-detail/user-detail.vue';
import UserUpdateForm from '@/views/admin/user-group/detail/update/update.vue';
import UserCreateForm from '@/views/admin/user-group/detail/create/create.vue';
import type { UserFormExposeType } from '@/interfaces';
import { USER_FORM_PURPOSE } from '@/enums';

type UserFormEmit = {
  reset: () => void;
  onSubmit: () => void;
  assignForm: (data: Record<string, any>) => void;
};

const userFormRef = useTemplateRef<UserFormExposeType>('userFormRef');
const dialogVisible = ref<boolean>(false);
const purpose = ref<USER_FORM_PURPOSE>(USER_FORM_PURPOSE.CREATE);
const emit = defineEmits<{
  (e: 'search'): void;
}>();

const openDialog = (): void => {
  dialogVisible.value = true;
};

const closeDialog = (): void => {
  dialogVisible.value = false;
};

const showCreateUserDialog = (purposeValue: USER_FORM_PURPOSE): void => {
  purpose.value = purposeValue;
  openDialog();
  nextTick(() => {
    Object.assign(userFormEmit, userFormRef.value);
  });
};

const assignForm = (data: Record<string, any>): void => {
  nextTick(() => {
    userFormEmit.assignForm(data);
  });
};

const search = (): void => {
  emit('search');
};

const userFormEmit = reactive<UserFormEmit>({
  reset: () => {},
  onSubmit: () => {},
  assignForm: () => {},
});

const component = computed(() => purpose.value === USER_FORM_PURPOSE.UPDATE ? UserUpdateForm : UserCreateForm);

defineExpose({
  assignForm,
  showCreateUserDialog,
});
</script>
