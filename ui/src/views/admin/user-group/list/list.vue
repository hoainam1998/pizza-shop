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
        <el-button size="small" class="ps-fw-bold" type="success" @click="getUserDetail(props.row.userId)">
          Update
        </el-button>
        <el-button size="small" class="ps-fw-bold" type="danger" @click="deleteUser(props.row.userId)">
          Delete
        </el-button>
      </div>
    </template>
  </Table>
  <UserDetail ref="userDetail" v-model="dialogVisible" @refresh="search" />
</template>
<script setup lang="ts">
import { ref, type Ref, onBeforeMount, useTemplateRef } from 'vue';
import type { AxiosError, AxiosResponse } from 'axios';
import Table from '@/components/common/table.vue';
import NewButton from '@/components/common/buttons/new-button/new-button.vue';
import SearchBox from '@/components/admin/search-box.vue';
import UserDetail from '@/views/admin/user-group/detail/detail.vue';
import UserDefaultImage from '@/assets/images/user.png';
import type { MessageResponseType, TableFieldType } from '@/interfaces';
import constants from '@/constants';
import { UserService } from '@/services';
import { SEX, POWER } from '@/enums';
import { showErrorNotification, showSuccessNotification } from '@/utils';
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
};

const userTableRef = useTemplateRef('userTable');
const userDetailRef = useTemplateRef('userDetail');
const dialogVisible = ref<boolean>(false);
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

const showCreateUserDialog = () => dialogVisible.value = true;

const getUserDetail = (userId: string): void => {
  UserService.post('detail', {
    userId,
    query: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      sex: true,
    },
  }).then((response: AxiosResponse) => {
    userDetailRef.value?.assignForm(response.data);
    showCreateUserDialog();
  });

};

const deleteUser = (userId: string): void => {
  UserService.delete(`delete/${userId}`)
    .then((response: AxiosResponse<MessageResponseType>) => {
      showSuccessNotification('Delete user', response.data.messages);
      search();
    }).catch((error: AxiosError<MessageResponseType>) => {
      showErrorNotification('Delete user', error.response!.data.messages);
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
