<template>
  <div class="ps-border-radius-5
  ps-border-color-f39c12
  ps-border-width-2
  ps-border-style-solid
  ps-py-10
  ps-mb-30
  ps-mx-5">
    <el-image
    :src="user.avatar || UserDefaultImage"
    fit="cover"
    class="ps-display-block ps-margin-auto ps-w-90px ps-h-90px" />
    <h5 class="ps-mt-5 ps-text-align-center ps-text-truncate-2 ps-px-7">
      {{ user.email }}
    </h5>
    <hr class="ps-mt-7" />
    <div class="ps-mt-7 ps-text-align-center">
      <el-button size="small" type="primary" class="ps-fw-bold">Personal</el-button>
      <el-button size="small" type="danger" class="ps-fw-bold" @click="logout">Logout</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { userStore as user } from '@/store';
import UserDefaultImage from '@/assets/images/user.png';
import { UserService } from '@/services';
import useWrapperRouter from '@/composables/use-router';
import paths from '@/router/paths';
import { showErrorNotification } from '@/utils';
import Storage from '@/storage/storage';

const { push } = useWrapperRouter();

const logout = (): void => {
  UserService.get('logout')
    .then(() => {
      push(paths.LOGIN);
      Storage.clear();
    })
    .catch((error) => {
      showErrorNotification('Logout', error.response.data.messages);
    });
};
</script>
