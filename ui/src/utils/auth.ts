import type {  RouteLocationAsPathGeneric } from 'vue-router';
import Storage from '@/storage/storage';
import paths from '@/router/paths';
import { cookie as cookieStore } from '@/store';
import SocketService from '@/socket';
import { SOCKET_EVENT_NAME } from '@/enums';

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
  SocketService.emit(SOCKET_EVENT_NAME.LOGOUT);
  globalThis.router.push(`${paths.LOGIN}`);
  Storage.clear();
  cookieStore.clearApiKey();
};
