<template>
  <el-dialog v-model="deleteDialogVisible" title="Delete" width="500">
    Are you want delete this item out of cart!
    <template #footer>
      <div class="dialog-footer">
        <el-button size="small" @click="close">Cancel</el-button>
        <el-button size="small" type="danger" @click="confirm">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
const deleteDialogVisible = defineModel<boolean>();
const emit = defineEmits<{
  (e: 'confirm'): void;
}>();

const close = () => {
  deleteDialogVisible.value = false;
};

const confirm = () => {
  emit('confirm');
  close();
};
</script>
