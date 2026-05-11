<template>
  <div class="ps-display-flex ps-flex-gap-5 ps-mt-35 ps-mb-5">
    <NewButton @click="showCreateUserDialog" />
    <SearchBox v-model="keyword" @search="search" />
  </div>
  <Table ref="userTable" :fields="fields" :data="data" :total="total" emptyText="Users are empty!"
    @pagination="fetchUsers">
    <template #avatar="props">
      <img :src="props.row.avatar || UserDefaultImage" height="50" width="50" :alt="props.row.name" />
    </template>
    <template #name="props">
      {{ props.row.firstName }} {{ props.row.lastName }}
    </template>
    <template #expiredTime="props">
      {{ $formatDateHyphen(props.row.expiredTime) }}
    </template>
    <template #price="props">
      {{ $formatVNDCurrency(props.row.price) }}
    </template>
    <template #power="props">
      {{ POWER[props.row.power] }}
    </template>
    <template #sex="props">
      {{ SEX[props.row.sex] }}
    </template>
    <template #operation="props">
      <div class="ps-text-align-center">
        <el-button size="small" class="ps-fw-bold" type="success" @click="getUserDetail(props.row)">
          Update
        </el-button>
        <el-button size="small" class="ps-fw-bold" type="danger" @click="deleteUser(props.row)">
          Delete
        </el-button>
        <el-button
          v-if="!props.row.isFirstTime"
          size="small"
          class="ps-fw-bold"
          type="primary"
          plain
          @click="updatePower(props.row)">
          {{ props.row.power === POWER.SALE ? 'To admin role' : 'To sale role' }}
        </el-button>
        <el-button
          type="warning"
          size="small"
          class="ps-fw-bold"
          plain
          @click="updateStatus(props.row)">
          {{ props.row.active === STATUS.UN_BLOCK ? 'Block' : 'Un block' }}
        </el-button>
      </div>
    </template>
  </Table>
  <UserDetail ref="userDetail" @search="search" />
</template>
<script setup lang="ts">
import { ref, type Ref, onBeforeMount, useTemplateRef } from 'vue';
import type { AxiosError, AxiosResponse } from 'axios';
import Table from '@/components/common/table/table.vue';
import NewButton from '@/components/common/buttons/new-button/new-button.vue';
import SearchBox from '@/components/admin/search-box/search-box.vue';
import UserDetail from '@/views/admin/user-group/detail/detail.vue';
import UserDefaultImage from '@/assets/images/user.png';
import type { MessageResponseType, TableFieldType } from '@/interfaces';
import constants from '@/constants';
import { UserService } from '@/services';
import { SEX, POWER, STATUS, USER_FORM_PURPOSE } from '@/enums';
import { confirmDeleteMessageBox, showErrorNotification, showSuccessNotification } from '@/utils';
import { cookie as cookieStore } from '@/store';
const PAGE_SIZE = constants.PAGINATION.PAGE_SIZE;
const PAGE_NUMBER = constants.PAGINATION.PAGE_NUMBER;

defineOptions({
  inheritAttrs: false
});

type UserType = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sex: number;
  power: number;
  active: number;
  apiKey: string;
  isFirstTime: boolean;
};

const showDeleteUserDialog = confirmDeleteMessageBox(
  'Delete user!',
  'This user and all information relative will be delete! Are you sure to be continue?',
  'Delete user request was cancel!');

const userTableRef = useTemplateRef('userTable');
const userDetailRef = useTemplateRef('userDetail');
const data: Ref<UserType[]> = ref([]);
const total: Ref<number> = ref(0);
const keyword: Ref<string> = ref('');

const fields: TableFieldType[] = [
  {
    label: 'Avatar',
    key: 'avatar',
    width: 200,
  },
  {
    label: 'Name',
    key: 'name',
    width: 350,
  },
  {
    label: 'Email',
    key: 'email',
    width: 300,
  },
    {
    label: 'Power',
    key: 'power',
    width: 150,
  },
  {
    label: 'Phone',
    key: 'phone',
    width: 200,
  },
  {
    label: 'Sex',
    key: 'sex',
    width: 150,
  },
  {
    key: 'operation',
  }
];

const showCreateUserDialog = (purpose: USER_FORM_PURPOSE = USER_FORM_PURPOSE.CREATE): void => {
  userDetailRef.value?.showCreateUserDialog(purpose);
};

const assignForm = (data: Record<string, any>): void => {
  userDetailRef.value?.assignForm(data);
};

const getUserDetail = (user: UserType): void => {
  cookieStore.setImpactUserApiKey(user.apiKey);
  UserService.post('detail', {
    userId: user.userId,
    query: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      sex: true,
    },
  }).then((response: AxiosResponse) => {
    showCreateUserDialog(USER_FORM_PURPOSE.UPDATE);
    assignForm({ ...response.data, apiKey: user.apiKey });
  }).catch((error: AxiosError<MessageResponseType>) => {
    showErrorNotification('Get user!', error.response?.data.messages);
  });
};

const deleteUser = (user: UserType): void => {
  const deleteUserService = (): Promise<AxiosResponse> => {
    cookieStore.setImpactUserApiKey(user.apiKey);
    return UserService.delete(`delete/${user.userId}`).then((response) => {
      search();
      return response;
    });
  };

  showDeleteUserDialog(deleteUserService);
};

const updatePower = (user: UserType): void => {
  cookieStore.setImpactUserApiKey(user.apiKey);
  const power = user.power === POWER.SALE ? POWER.ADMIN : POWER.SALE;
  UserService.put('update-power', {
    userId: user.userId,
    power,
  }).then((response: AxiosResponse<MessageResponseType>) => {
    search();
    showSuccessNotification('Update power!', response.data.messages);
  }).catch((error: AxiosError<MessageResponseType>) => {
    showErrorNotification('Update power!', error.response?.data.messages);
  });
};

const updateStatus = (user: UserType): void => {
  cookieStore.setImpactUserApiKey(user.apiKey);
  const active = user.active === STATUS.UN_BLOCK ? STATUS.BLOCK : STATUS.UN_BLOCK;
  UserService.put('update-status', {
    userId: user.userId,
    active,
  }).then((response: AxiosResponse<MessageResponseType>) => {
    search();
    showSuccessNotification('Update user status!', response.data.messages);
  }).catch((error: AxiosError<MessageResponseType>) => {
    showErrorNotification('Update user status!', error.response?.data.messages);
  });
};

const search = (): void => {
  fetchUsers(userTableRef.value?.pageSize || PAGE_SIZE, PAGE_NUMBER);
};

const fetchUsers = (pageSize: number, pageNumber: number): void => {
  UserService.post('pagination', {
    pageSize,
    pageNumber,
    search: keyword.value,
    query: {
      avatar: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      sex: true,
      power: true,
      active: true,
      apiKey: true,
      isFirstTime: true,
    }
  }, { allowNotFound: true }).then((response) => {
    data.value = response.data.list;
    total.value = response.data.total;
  }).catch(() => {
    data.value = [];
    total.value = 0;
  });
};

onBeforeMount(() => fetchUsers(PAGE_SIZE, PAGE_NUMBER));
</script>
