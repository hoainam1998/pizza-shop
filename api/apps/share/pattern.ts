import { createMicroserviceEvent } from './utils';

// category
export const createCategoryPattern = createMicroserviceEvent('create');
export const paginationCategoryPattern = createMicroserviceEvent('pagination');
export const updateCategoryPattern = createMicroserviceEvent('update');
export const deleteCategoryPattern = createMicroserviceEvent('delete');
export const getCategoryPattern = createMicroserviceEvent('get');

// user
export const canSignupPattern = createMicroserviceEvent('can_signup');
export const signupPattern = createMicroserviceEvent('signup');

// ingredient
export const createIngredientPattern = createMicroserviceEvent('create_ingredient');
export const computeProductPrice = createMicroserviceEvent('compute_product_price');
