import RouterPath from './router-path';

export default Object.freeze({
  BASE: new RouterPath('/'),
  SIGNUP: new RouterPath('/signup'),
  LOGIN: new RouterPath('/login'),
  HOME: new RouterPath('/home', {
    PRODUCT: new RouterPath('product', {
      NEW: new RouterPath('new'),
    }),
    CATEGORY: new RouterPath('category'),
  }),
  ID: new RouterPath(':/id'),
});
