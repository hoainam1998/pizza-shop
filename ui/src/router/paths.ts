import RouterPath from './router-path';

export default Object.freeze({
  BASE: new RouterPath('/'),
  SIGNUP: new RouterPath('/signup'),
  RESET_PASSWORD: new RouterPath('/reset-password'),
  LOGIN: new RouterPath('/login'),
  HOME: new RouterPath('/home', {
    PRODUCT: new RouterPath('product', {
      NEW: new RouterPath('new'),
    }),
    INGREDIENT: new RouterPath('ingredient', {
      NEW: new RouterPath('new'),
    }),
    CATEGORY: new RouterPath('category'),
  }),
  ID: new RouterPath(':id'),
});
