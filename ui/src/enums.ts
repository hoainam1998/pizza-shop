/* eslint-disable no-unused-vars */
export enum EMAIL_DOMAIN {
  GMAIL = '@gmail.com',
  OUTLOOK = '@outlook.com',
}

export enum OBJECT_STORE_NAME {
  CARTS = 'carts',
}

export enum SOCKET_EVENT_NAME {
  REFRESH = 'refresh',
  REFRESH_ALL_PRODUCT = 'refresh_all_product',
  REMOVE_REPORT_VIEWER = 'remove_report_viewer',
  ADD_DATA_CHART = 'add_data_chart',
  UPDATE_USER_STATUS = 'update_user_status',
  UPDATE_USER_POWER = 'update_user_power',
  UPDATE_USER_INFO = 'update_user_info',
  LOGOUT = 'logout',
}

export enum ERROR_PRODUCT_STATE {
  DISABLED_PRODUCT = 'DISABLED_PRODUCT',
  REFRESH_PRODUCT = 'REFRESH_PRODUCT',
}

export enum CHART_MODE {
  DAY = 'day',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export enum POWER {
  SUPER_ADMIN = 0,
  ADMIN = 1,
  SALE = 2,
}

export enum STATUS {
  UN_BLOCK = 0,
  BLOCK = 1,
}

export enum SEX {
  FEMALE = 1,
  MALE = 0,
}

export enum USER_FORM_PURPOSE  {
  CREATE = 'create',
  UPDATE = 'update',
}
