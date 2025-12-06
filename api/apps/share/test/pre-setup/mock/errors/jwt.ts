import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
const currentDate = new Date();
const expiredDate = new Date(currentDate.setDate(currentDate.getDate() - 1));

export const JsonWebTokenUnknownError = new JsonWebTokenError('jwt unknown error');
export const JsonWebTokenExpiredError = new TokenExpiredError('jwt expired', expiredDate);
export const JsonWebTokenMalformedError = new JsonWebTokenError('jwt malformed');
