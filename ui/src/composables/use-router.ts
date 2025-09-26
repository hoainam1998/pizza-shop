import type RouterPath from '@/router/router-path';
import { useRouter } from 'vue-router';

export default function() {
  const router = useRouter();

  const push = (path: RouterPath | string) => {
    router.push(`${path}`);
  };

  return {
    push,
  };
}
