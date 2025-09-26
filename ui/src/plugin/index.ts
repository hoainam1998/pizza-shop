import { formatDateSlash, formatDateHyphen, formatVNDCurrency } from '@/utils';

export default {
  install: (app: any) => {
    app.config.globalProperties = {
      $formatDateSlash: formatDateSlash,
      $formatDateHyphen: formatDateHyphen,
      $formatVNDCurrency: formatVNDCurrency
    };
  }
};
