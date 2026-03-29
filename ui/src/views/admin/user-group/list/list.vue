<template>
  <NewButton class="ps-mt-7" @onClick="showCreateUserDialog" />
  <Table ref="userTable" :fields="fields" :data="data" :total="total" emptyText="Users are empty!"
    @pagination="fetchUsers">
    <template #avatar="props">
      <img :src="props.row.avatar" height="50" width="50" :alt="props.row.name" />
    </template>
    <template #expiredTime="props">
      {{ $formatDateHyphen(props.row.expiredTime) }}
    </template>
    <template #price="props">
      {{ $formatVNDCurrency(props.row.price) }}
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
  <UserDetail v-model="dialogVisible" />
</template>
<script setup lang="ts">
import { ref, type Ref } from 'vue';
import Table from '@/components/common/table.vue';
import NewButton from '@/components/common/buttons/new-button/new-button.vue';
import UserDetail from '@/views/admin/user-group/detail/detail.vue';
import type { TableFieldType } from '@/interfaces';
import constants from '@/constants';
import { UserService } from '@/services';
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

const dialogVisible = ref<boolean>(false);
const data: Ref<UserType[]> = ref([]);
const total: Ref<number> = ref(0);

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
  // TODO
};

const deleteUser = (userId: string): void => {
  // TODO
};

const fetchUsers = (pageSize: number, pageNumber: number): void => {
  UserService.post('pagination', {
    pageSize,
    pageNumber,
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
</script>
