import type {  RouteLocationAsPathGeneric } from 'vue-router';
import paths from '@/router/paths';

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
    }
  });
