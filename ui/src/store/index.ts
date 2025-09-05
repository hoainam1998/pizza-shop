import type { InjectionKey } from 'vue';
import { createStore, useStore as baseUseStore, Store } from 'vuex';
import loading from './modules/loading';
import auth from './modules/auth';
import { type State } from './type';

export const key: InjectionKey<Store<State>> = Symbol('vuex');

const store = createStore<State>({
  modules: {
    loading,
    auth,
  },
});

export function useStore () {
  return baseUseStore(key);
}

export default store;
