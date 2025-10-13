/* eslint-disable no-var */

import 'vue';
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, any>;
  export default component;
};
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $formatDateHyphen(timestamp: string | number): string;
    $formatDateSlash(timestamp: string | number): string;
    $formatVNDCurrency(value: string | number): string;
  }
};
declare global {
  namespace globalThis {
    var isSale: boolean;
    var isAdmin: boolean;
  }
};
