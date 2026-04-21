import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AdminResetPasswordTokenPayload } from '@share/interfaces';
import { POWER_NUMERIC } from '@share/enums';
const RESET_PASSWORD_URL = '{origin}/reset-password?token={token}';

/**
 * Verify async jwt token.
 *
 * @param {string} token - The jwt reset password token.
 * @param {string} secretKey - The secret key
 * @returns {Promise<jwt.JwtPayload>} - The payload result.
 */
const verifyAsync = (token: string, secretKey: string): Promise<jwt.JwtPayload> => {
  return new Promise((resolve, reject) => {
    try {
      resolve(jwt.verify(token, secretKey) as jwt.JwtPayload);
    } catch (error) {
      reject(error as Error);
    }
  });
};

/**
 * Signing admin reset password token.
 *
 * @param {AdminResetPasswordTokenPayload} payload - The register payload.
 * @param {string} [expires='1h'] - The expired time.
 * @return {string} - The reset password token.
 */
const signingAdminResetPasswordToken = (
  payload: AdminResetPasswordTokenPayload,
  expires: string | number = '1h',
): string => jwt.sign(payload, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY!, { expiresIn: expires } as SignOptions);

/**
 * Verify admin reset password token.
 *
 * @param {string} resetPasswordToken - The reset password token.
 * @returns {Promise<jwt.JwtPayload>} - The verify result.
 */
const verifyAdminResetPasswordToken = (resetPasswordToken: string): Promise<jwt.JwtPayload> =>
  verifyAsync(resetPasswordToken, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY!);

/**
 * Verify client reset password token.
 *
 * @param {string} resetPasswordToken - The reset password token.
 * @return {object} - The verify result.
 */
const verifyClientResetPasswordToken = (resetPasswordToken: string): jwt.JwtPayload =>
  jwt.verify(resetPasswordToken, process.env.CLIENT_RESET_PASSWORD_SECRET_KEY!) as jwt.JwtPayload;

/**
 * Signing login token with payload is email and userId.
 *
 * @param {string} userId - The userId.
 * @param {string} email - An email register.
 * @param {number} power - The user number.
 * @return {string} - The login token.
 */
const signLoginToken = (userId: string, email: string, power: number): string =>
  jwt.sign({ userId, email, power }, process.env.SECRET_KEY!, { expiresIn: '1h' });

/**
 * Signing client login token with payload is email.
 *
 * @param {string} email - An email register.
 * @return {string} - The client login token.
 */
const signClientLoginToken = (email: string): string => jwt.sign({ email }, process.env.CLIENT_LOGIN_SECRET_KEY!);

/**
 * Verify client login token.
 *
 * @param {string} clientLoginToken - The client login token.
 * @return {object} - The data decoded.
 */
const verifyClientLoginToken = (clientLoginToken: string): jwt.JwtPayload =>
  jwt.verify(clientLoginToken, process.env.CLIENT_LOGIN_SECRET_KEY!) as jwt.JwtPayload;

/**
 * Signing client reset password token.s
 *
 * @param {string} email - An email register.
 * @return {string} - The client reset password token.
 */
const signClientResetPasswordToken = (email: string): string =>
  jwt.sign({ email }, process.env.CLIENT_RESET_PASSWORD_SECRET_KEY!, { expiresIn: '1h' });

/**
 * Verify login token.
 *
 * @param {string} loginToken - The login token.
 * @return {object} - The data decoded.
 */
const verifyLoginToken = (loginToken: string): jwt.JwtPayload =>
  jwt.verify(loginToken, process.env.SECRET_KEY!) as jwt.JwtPayload;

/**
 * Signing user logged token.
 *
 * @param {Record<string, any>} payload - The user data.
 * @return {string} - The user logged token.
 */
const signUserLoggedToken = (payload: Record<string, any>): string =>
  jwt.sign(payload, process.env.USER_LOGGED_SECRET_KEY!);

/**
 * Verify user logged token.
 *
 * @param {string} userLoggedToken - The user logged token.
 * @return {object} - The data decoded.
 */
const verifyUserLoggedToken = (userLoggedToken: string): jwt.JwtPayload =>
  jwt.verify(userLoggedToken, process.env.USER_LOGGED_SECRET_KEY!) as jwt.JwtPayload;

/**
 * Signing API key.
 *
 * @param {Record<string, any>} payload - The user data.
 * @return {string} - The api key.
 */
const signApiKey = (payload: Record<string, any>): string => jwt.sign(payload, process.env.API_KEY!);

/**
 * Verify api key.
 *
 * @param {string} api key - The api key.
 * @return {object} - The data decoded.
 */
const verifyApiKey = (userLoggedToken: string): jwt.JwtPayload =>
  jwt.verify(userLoggedToken, process.env.API_KEY!) as jwt.JwtPayload;

/**
 * Hashing password
 *
 * @async
 * @param {string} password - The password.
 * @return {Promise<string>} -The password decoded.
 */
const passwordHashing = async (password: string): Promise<string> => {
  const saltRound = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, saltRound);
};

/**
 * Compare password
 *
 * @param {string} password - The password.
 * @param {string} passwordCompare - The password compare.
 * @return {boolean} -The compare result.
 */
const comparePassword = (password: string, passwordCompare: string): boolean => {
  return bcrypt.compareSync(password, passwordCompare);
};

/**
 * Generate the new password.
 *
 * @return {string} - The new password.
 */
const autoGeneratePassword = (): string => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let password = '';

  for (let i = 0; i < 8; i++) {
    const index = Math.floor(Math.random() * chars.length);
    password += chars.charAt(index);
  }
  return password;
};

/**
 * Return reset password link.
 *
 * @param {string} resetPasswordToken - The reset password token.
 * @param {POWER_NUMERIC} role - The user role.
 * @return {string} - The reset password link.
 */
const getResetPasswordLink = (resetPasswordToken: string, role: POWER_NUMERIC): string => {
  const origin = role === POWER_NUMERIC.SALE ? process.env.SALE_ORIGIN_CORS! : process.env.ADMIN_ORIGIN_CORS!;
  return RESET_PASSWORD_URL.replace(/{origin}/, origin).replace(/{token}/, resetPasswordToken);
};

// /**
//  * Return client reset password link.
//  *
//  * @param {string} resetPasswordToken - The reset password token.
//  * @return {string} - The reset password link.
//  */
// const getClientResetPasswordLink = (resetPasswordToken: string): string =>
//   RESET_PASSWORD_URL.format(process.env.CLIENT_ORIGIN_CORS, resetPasswordToken);

export {
  signingAdminResetPasswordToken,
  signClientResetPasswordToken,
  signClientLoginToken,
  signUserLoggedToken,
  verifyUserLoggedToken,
  passwordHashing,
  autoGeneratePassword,
  verifyAdminResetPasswordToken,
  verifyClientResetPasswordToken,
  signLoginToken,
  verifyLoginToken,
  signApiKey,
  verifyApiKey,
  verifyClientLoginToken,
  getResetPasswordLink,
  comparePassword,
  // getClientResetPasswordLink,
};
