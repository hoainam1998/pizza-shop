import { type AuthStore } from './type';
import { SET_CAN_SIGNUP } from './actions';
import type { ActionContext } from 'vuex';

export default {
  namespaced: true,
  state: (): AuthStore => ({
    canSignup: false
  }),
  mutations: {
    [SET_CAN_SIGNUP]: (state: AuthStore, payload: boolean): void => {
      state.canSignup = payload;
    }
  },
  actions: {
    [SET_CAN_SIGNUP]: ({ commit }: ActionContext<AuthStore, any>, payload: boolean): void => {
      commit(SET_CAN_SIGNUP, payload);
    }
  }
};
