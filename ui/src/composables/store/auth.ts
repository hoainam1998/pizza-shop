import { computed } from 'vue';
import { useStore } from '@/store';
import { SET_CAN_SIGNUP } from '@/store/modules/auth/actions';

export default () => {
  const store = useStore();

  return {
    state: {
      canSignup: computed(() => store.state.auth.canSignup),
    },
    action: {
      setCanSignup: (canSignup: boolean) => store.dispatch(`auth/${SET_CAN_SIGNUP}`, canSignup),
    },
  };
};
