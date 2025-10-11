import { createMicroserviceEvent } from './utils';

// common
export const paginationPattern = createMicroserviceEvent('pagination');

// category
export const createCategoryPattern = createMicroserviceEvent('create');
export const updateCategoryPattern = createMicroserviceEvent('update');
export const deleteCategoryPattern = createMicroserviceEvent('delete');
export const getCategoryPattern = createMicroserviceEvent('detail');
export const getAllCategoriesPattern = createMicroserviceEvent('all');

// user
export const canSignupPattern = createMicroserviceEvent('can_signup');
export const signupPattern = createMicroserviceEvent('signup');

// ingredient
export const createIngredientPattern = createMicroserviceEvent('create_ingredient');
export const computeProductPrice = createMicroserviceEvent('compute_product_price');
export const getAllIngredients = createMicroserviceEvent('get_all_ingredients');

// product
export const createProductPattern = createMicroserviceEvent('create_product');
export const getProductPattern = createMicroserviceEvent('get_product');
