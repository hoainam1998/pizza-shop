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
  REMOVE_REPORT_VIEWER = 'remove_report_viewer',
  ADD_DATA_CHART = 'add_data_chart',
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
