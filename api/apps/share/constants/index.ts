export default Object.freeze({
  SEX: {
    MALE: 0,
    FEMALE: 1,
  },
  POWER_NUMERIC: {
    SUPER_ADMIN: 0,
    ADMIN: 1,
    SALE: 2,
  },
  REDIS_PREFIX: {
    SESSION_KEY: 'ps:',
    CATEGORIES: 'categories',
    INGREDIENTS: 'ingredients',
    PRODUCT: 'product:',
    USER_PRODUCT: 'user_product:',
    REPORT_VIEWER: 'report_viewer',
  },
  PASSWORD_PATTERN: /[A-Za-z0-9@$#%!^&*()]{8}/,
});
