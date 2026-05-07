<template>
  <el-dialog
    v-model="dialogVisible"
    width="35%"
    align-center
    center
    header-class="ps-mb-10"
    footer-class="ps-pt-0"
    @close="reset">
    <slot name="default" />
    <template #footer>
      <el-button class="ps-w-100px" type="success" @click="onSubmit">Save</el-button>
      <el-button class="ps-w-100px" type="warning" @click="closeDialog">Close</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
const dialogVisible = defineModel<boolean>();
const emit = defineEmits<{
  (e: 'onSubmit'): void;
  (e: 'resetForm'): void;
  (e: 'closeDialog'): void;
}>();

const reset = (): void => {
  emit('resetForm');
};

const onSubmit = (): void => {
  emit('onSubmit');
};

const closeDialog = (): void => {
  emit('closeDialog');
};
</script>
