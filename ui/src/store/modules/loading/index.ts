import { type ActionContext } from 'vuex';
import { type LoadingStore } from './type';
import { HIDE_LOADING, SHOW_LOADING } from './actions';

export default {
  namespaced: true,
  state: (): LoadingStore => ({
    loading: false,
  }),
  mutations: {
    [SHOW_LOADING]: (state: LoadingStore): void => {
      state.loading = true;
    },
    [HIDE_LOADING]: (state: LoadingStore): void => {
      state.loading = false;
    },
  },
  actions: {
    [SHOW_LOADING]: ({ commit }: ActionContext<LoadingStore, any>): void => {
      commit(SHOW_LOADING);
    },
    [HIDE_LOADING]: ({ commit }: ActionContext<LoadingStore, any>): void => {
      commit(HIDE_LOADING);
    }
  },
};
