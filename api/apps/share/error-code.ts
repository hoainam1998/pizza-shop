class ErrorCode {
  /**
   * Email already exist.
   */
  static EMAIL_REGIS_ALREADY_EXIST = 'EMAIL_REGIS_ALREADY_EXIST';

  /**
   * Already has a super admin. You can not signup.
   */
  static CAN_NOT_SIGNUP = 'CAN_NOT_SIGNUP';

  /**
   * Product has expired or did not exist!
   */
  static DISABLED_PRODUCT = 'DISABLED_PRODUCT';

  /**
   * Product miss update.
   */
  static REFRESH_PRODUCT = 'REFRESH_PRODUCT';
}

export default ErrorCode;
