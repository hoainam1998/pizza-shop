import type { NavigationGuardNext, RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router';
import { auth as authStore, currentRoute as currentRouteStorage } from '@/store';
import { POWER } from '@/enums';
import paths from '@/router/paths';
import names from '@/router/names';

const defaultPath: string = `${paths.HOME}/${paths.HOME.CATEGORY}`;

export default (to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded, next: NavigationGuardNext) => {
  const alreadyLogin = authStore.getAlreadyLogin();
  const power = authStore.getUserPower();
  const path = currentRouteStorage.getCurrentRoute() || defaultPath;
  const superAdminPath = [paths.HOME.USER.Path, paths.HOME.REPORT.Path];

  if (alreadyLogin) {
    if (to.meta.requiresAuth) {
      if (superAdminPath.some((p) => to.path.includes(p))) {
        if (power !== POWER.SUPER_ADMIN) {
          return next({ name: names.NotFound });
        }
      }
      currentRouteStorage.setCurrentRoute(to.path);
      return next();
    } else {
      if (to.name !== names.NotFound) {
        return next(path);
      }
      return next();
    }
  } else {
    if (!to.meta.requiresAuth) {
      return next();
    }
    return next(paths.LOGIN.Path);
  }
};
