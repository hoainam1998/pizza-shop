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
    USER: new RouterPath('user', {
      NEW: new RouterPath('new'),
      ID: new RouterPath(':id'),
    }),
    CATEGORY: new RouterPath('category'),
    REPORT: new RouterPath('report'),
  }),
  ID: new RouterPath(':id'),
  CART: new RouterPath('/cart'),
  PERSONAL: new RouterPath('/personal'),
});
