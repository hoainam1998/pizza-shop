import { computed } from 'vue';
import { useStore } from '@/store';
import { HIDE_LOADING, SHOW_LOADING } from '@/store/modules/loading/actions';

export default () => {
  const store = useStore();

  return {
    state: {
      loading: computed(() => store.state.loading.loading),
    },
    action: {
      showLoading: () => store.dispatch(`loading/${SHOW_LOADING}`),
      hideLoading: () => store.dispatch(`loading/${HIDE_LOADING}`),
    },
  };
};
