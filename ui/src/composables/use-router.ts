import type RouterPath from '@/router/router-path';
import { useRouter, type RouteLocationAsPathGeneric } from 'vue-router';

export default function() {
  const router = globalThis.router || useRouter();

  const push = (path: RouterPath | string | RouteLocationAsPathGeneric) => {
    if (typeof path === 'object') {
      if ((<any>Object).hasOwn(path, 'path')) {
        return router.push(path as RouteLocationAsPathGeneric);
      }
    }
    router.push(`${path}`);
  };

  return {
    push,
  };
}
