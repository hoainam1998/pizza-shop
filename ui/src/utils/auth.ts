import type {  RouteLocationAsPathGeneric } from 'vue-router';
import Storage from '@/storage/storage';
import SocketService from '@/socket';
import paths from '@/router/paths';
import { cookie as cookieStore } from '@/store';

/**
 * Generate reset password link.
 *
 * @param {string} resetPasswordToken - The reset password token.
 * @returns {RouteLocationAsPathGeneric} - The route object.
 */
export const generateResetPasswordLink = (resetPasswordToken: string): RouteLocationAsPathGeneric =>
  ({
    path: paths.RESET_PASSWORD.Path,
    query: {
      token: resetPasswordToken
    },
  });

/**
 * Force logout.
 */
export const forceLogout = (): void => {
  globalThis.router.push(`${paths.LOGIN}`);
  Storage.clear();
  SocketService.disconnect();
  cookieStore.clearApiKey();
};
