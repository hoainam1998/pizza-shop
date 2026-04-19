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
      <el-button size="small" type="primary" class="ps-fw-bold" @click="goToPersonal">Personal</el-button>
      <el-button size="small" type="danger" class="ps-fw-bold" @click="logout">Logout</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { auth as authStore } from '@/store';
import UserDefaultImage from '@/assets/images/user.png';
import useWrapperRouter from '@/composables/use-router';
import useLogout from '@/composables/use-logout';
import paths from '@/router/paths';

const { push } = useWrapperRouter();
const user = authStore.getUser();
const logout = useLogout();

const goToPersonal = () => push(paths.PERSONAL);
</script>
