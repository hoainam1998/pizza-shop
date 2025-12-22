import type { NavigationGuardNext, RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router';
import { auth as authStore, currentRoute as currentRouteStorage } from '@/composables/store';
import SearchParams from '@/services/search-params';
import paths from '../paths';

export default (to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded, next: NavigationGuardNext) => {
  const alreadyLogin = authStore.getAlreadyLogin();
  SearchParams.create();
  if (alreadyLogin) {
    if (to.meta.requiresAuth) {
      currentRouteStorage.setCurrentRoute(to.path);
      return next();
    } else {
      const path = currentRouteStorage.getCurrentRoute() || paths.HOME.Path;
      return next(path);
    }
  } else {
    if (!to.meta.requiresAuth) {
      return next();
    }
    return next(paths.LOGIN.Path);
  }
};
