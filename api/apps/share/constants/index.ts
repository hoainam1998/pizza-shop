export default Object.freeze({
  REDIS_PREFIX: {
    SESSION_KEY: 'ps:',
    CATEGORIES: 'categories',
    INGREDIENTS: 'ingredients',
    PRODUCT: 'product:',
    USER: 'user',
    USER_PRODUCT: 'user_product:',
    REPORT_VIEWER: 'report_viewer',
  },
  PASSWORD_PATTERN: /[A-Za-z0-9@$#%!^&*()]{8}/,
  IMPACT_USER_API_KEY: 'impact_user_api_key',
});
