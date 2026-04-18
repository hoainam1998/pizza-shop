<template>
  <el-popconfirm :icon="null" class="ps-px-5">
    <template #reference>
     <div class="ps-border-radius-50
      ps-border-width-1
      ps-border-style-solid
      ps-border-color-black
      ps-w-40px ps-h-40px
      ps-bg-white
      ps-px-4
      ps-py-4">
        <el-image
        :src="user.avatar || UserDefaultImage"
        fit="cover"
        class="ps-display-block ps-margin-auto" />
      </div>
    </template>
    <template #actions>
      <h5 class="ps-mt-5 ps-text-align-center ps-text-truncate-2 ps-px-7">
      {{ user.email }}
      </h5>
      <div class="ps-display-flex ps-flex-direction-column ps-flex-gap-7">
        <el-button class="ps-mx-0" type="primary" plain size="small" @click="goToPersonal">Personal</el-button>
        <el-button class="ps-mx-0" type="warning" size="small" @click="logout">Logout</el-button>
      </div>
    </template>
  </el-popconfirm>
</template>
<script setup lang="ts">
import { auth as authStore  } from '@/store';
import UserDefaultImage from '@/assets/images/user.png';
import { UserService } from '@/services';
import useWrapperRouter from '@/composables/use-router';
import paths from '@/router/paths';
import { showErrorNotification } from '@/utils';
import Storage from '@/storage/storage';

const { push } = useWrapperRouter();
const user = authStore.getUser();

const goToPersonal = () => push(paths.PERSONAL);

const logout = (): void => {
  UserService.get('logout')
    .catch((error) => {
      showErrorNotification('Logout', error.response.data.messages);
    }).finally(() => {
      push(paths.LOGIN);
      Storage.clear();
    });
};
</script>
<style>
.el-popconfirm__action {
  margin: 0 !important;
}

.el-popper {
  padding-left: 7px !important;
  padding-right: 7px !important;
}
</style>
