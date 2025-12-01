import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const RESET_PASSWORD_URL = '{origin}/reset-password?token={token}';

/**
 * Generate the new password.
 *
 * @param {string} email - The register email.
 * @param {string} [expires='1h'] - The register email.
 * @return {string} - The reset password token.
 */
const signingAdminResetPasswordToken = (email: string, expires: string | number = '1h'): string =>
  jwt.sign({ email }, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY!, { expiresIn: expires } as SignOptions);

/**
 * Verify reset password token.
 *
 * @param {string} resetPasswordToken - The reset password token.
 * @return {object} - The verify result.
 */
const verifyResetPasswordToken = (resetPasswordToken: string): jwt.JwtPayload =>
  jwt.verify(resetPasswordToken, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY!) as jwt.JwtPayload;

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
 * @return {string} - The reset password link.
 */
const getAdminResetPasswordLink = (resetPasswordToken: string): string =>
  RESET_PASSWORD_URL.replace(/{origin}/, process.env.ADMIN_ORIGIN_CORS!).replace(/{token}/, resetPasswordToken);

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
  passwordHashing,
  autoGeneratePassword,
  verifyResetPasswordToken,
  verifyClientResetPasswordToken,
  signLoginToken,
  verifyLoginToken,
  verifyClientLoginToken,
  getAdminResetPasswordLink,
  comparePassword,
  // getClientResetPasswordLink,
};
