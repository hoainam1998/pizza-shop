import RouterPath from './router-path';

export default Object.freeze({
  BASE: new RouterPath('/'),
  SIGNUP: new RouterPath('/signup'),
  LOGIN: new RouterPath('/login'),
  HOME: new RouterPath('/home', {
    PRODUCT: 'product',
    CATEGORY: 'category',
  }),
});
