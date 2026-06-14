<template>
  <ResetPassword>
    <template #default="{ disabled, submit }">
      <el-button class="ps-display-block
      ps-margin-auto
      ps-fw-bold
      ps-w-150px" 
      type="primary" 
      :disabled="disabled" 
      @click="submit">
        Save
      </el-button>
    </template>
  </ResetPassword>
</template>
<script setup lang="ts">
import ResetPassword from '@/views/common/reset-password/reset-password.vue';
</script>
