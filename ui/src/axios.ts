import axios, { AxiosError, HttpStatusCode } from 'axios';
import store from './store';
import router from './router';
import paths from './router/paths';
import { SHOW_LOADING, HIDE_LOADING } from './store/modules/loading/actions';
import { showErrorNotification } from './utils';

/**
 * Force logout.
 */
const forceLogout = (): void => {
  router.push(paths.LOGIN);
};

/**
 * Handle axios request errors.
 *
 * @param {AxiosError} error - The axios error.
 */
const handleRequestError = (error: AxiosError<any, any>): void=> {
  switch (error.code) {
    case AxiosError.ERR_BAD_REQUEST:
      switch (error.request.status) {
        case HttpStatusCode.Unauthorized: {
        };
        break;
        default: break;
      }
      break;
    case AxiosError.ERR_NETWORK: {
      showErrorNotification(error.code || '', error.message);
      forceLogout();
    };
    break;
    default: {
      showErrorNotification(error.code || '', error.message);
    };
    break;
  }
};

const axiosInstance = axios.create({
  baseURL: process.env.BASE_URL,
});

axiosInstance.interceptors.request.use(
  function (config) {
    store.dispatch(`loading/${SHOW_LOADING}`);
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  function (response) {
    store.dispatch(`loading/${HIDE_LOADING}`);
    return response;
  },
  function (error) {
    handleRequestError(error);
    store.dispatch(`loading/${HIDE_LOADING}`);
    return Promise.reject(error);
  },
);

export default axiosInstance;
