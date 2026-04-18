import type { NavigationGuardNext, RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router';
import { auth as authStore, currentRoute as currentRouteStorage } from '@/store';
import paths from '@/router/paths';

const defaultPath: string = paths.HOME.Path;

export default (
  to: RouteLocationNormalized,
  from: RouteLocationNormalizedLoaded,
  next: NavigationGuardNext,
) => {
  const alreadyLogin = authStore.getAlreadyLogin();
  const path = currentRouteStorage.getCurrentRoute() || defaultPath;

  if (alreadyLogin) {
    if (to.meta.requiresAuth) {
      currentRouteStorage.setCurrentRoute(to.path);
      return next();
    } else {
      return next(path);
    }
  } else {
    if (!to.meta.requiresAuth) {
      return next();
    }
    return next(paths.LOGIN.Path);
  }
};
