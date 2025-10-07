export default Object.freeze({
  COMMON: {
    OUTPUT_VALIDATE: 'Output validate error!',
    DATABASE_DISCONNECT: 'Database was disconnect. Please try again!',
    MUTATING_DATABASE_ERROR: 'Something error when working with your database!',
    ALREADY_EXIST: 'This record have been exist!',
    COMMON_ERROR: 'Something have broken. Please try again!',
    EMPTY_FILE: '{fieldname} is an empty file!',
    FILE_TYPE_INVALID: 'File type is invalid!',
    VALIDATE_ID_FAIL: 'An id must be a string number and contains 13 character!',
  },
  CATEGORY: {
    NOT_FOUND: 'The category item requirement is not found!',
    ADD_CATEGORY_SUCCESS: 'Add category was success!',
    UPDATE_CATEGORY_SUCCESS: 'Update category was success!',
    DELETE_CATEGORY_SUCCESS: 'Delete category was success!',
  },
  USER: {
    YOUR_POWER_INVALID: 'Your power invalid!',
    YOUR_GENDER_INVALID: 'Your gender invalid!',
    SIGNUP_FAILED: 'Signup user was failed!',
    SIGNUP_SUCCESS: 'Signup user was success!. Please check your email!',
    EMAIL_REGIS_ALREADY_EXIST: 'Your email was already regis!',
    CAN_NOT_SIGNUP: 'Already has a super admin. You can not signup!',
  },
  INGREDIENT: {
    CREATE_INGREDIENT_SUCCESS: 'Create ingredient was success!',
    NAME_ALREADY_EXIST: 'Ingredient name has been exist!',
  },
  PRODUCT: {
    PRICE_INVALID: 'Product price is invalid!',
    CREATE_PRODUCT_SUCCESS: 'Create product was success!',
  },
});
