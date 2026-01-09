import { createMicroserviceEvent } from './utils';

// common
export const paginationPattern = createMicroserviceEvent('pagination');

// category
export const createCategoryPattern = createMicroserviceEvent('create');
export const updateCategoryPattern = createMicroserviceEvent('update');
export const deleteCategoryPattern = createMicroserviceEvent('delete');
export const getCategoryPattern = createMicroserviceEvent('detail');
export const getAllCategoriesPattern = createMicroserviceEvent('all');
export const filterValidCategoriesPattern = createMicroserviceEvent('filter_valid_categories');

// user
export const canSignupPattern = createMicroserviceEvent('can_signup');
export const signupPattern = createMicroserviceEvent('signup');
export const loginPattern = createMicroserviceEvent('login');
export const resetPasswordPattern = createMicroserviceEvent('reset_password');

// ingredient
export const createIngredientPattern = createMicroserviceEvent('create_ingredient');
export const computeProductPricePattern = createMicroserviceEvent('compute_product_price');
export const getAllIngredientsPattern = createMicroserviceEvent('get_all_ingredients');
export const deleteIngredientPattern = createMicroserviceEvent('delete_ingredient_pattern');
export const updateIngredientPattern = createMicroserviceEvent('update_ingredient');
export const getIngredientDetailPattern = createMicroserviceEvent('get_ingredient_detail');

// product
export const createProductPattern = createMicroserviceEvent('create_product');
export const getProductPattern = createMicroserviceEvent('get_product');
export const updateProductPattern = createMicroserviceEvent('update_product');
export const deleteProductPattern = createMicroserviceEvent('delete_product');
export const paginationForSalePattern = createMicroserviceEvent('pagination_for_sale');
export const getProductsInCartPattern = createMicroserviceEvent('get_products_in_cart');
