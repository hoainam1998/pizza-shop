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
export const logoutPattern = createMicroserviceEvent('logout');
export const resetPasswordPattern = createMicroserviceEvent('reset_password');
export const getUserDetailPattern = createMicroserviceEvent('get_user');
export const updateUserPattern = createMicroserviceEvent('update');
export const updatePersonalInfoPattern = createMicroserviceEvent('update-personal-info');
export const deleteUserPattern = createMicroserviceEvent('delete');

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
export const validateProductsInCartPattern = createMicroserviceEvent('validate_products_in_cart');
export const paymentPattern = createMicroserviceEvent('payment');
export const loadDataBestSellingProductsChartPattern = createMicroserviceEvent('load_data_best_selling_products_chart');
export const loadDataRevenueChartPattern = createMicroserviceEvent('load_data_revenue_chart');
export const loadDataPurchaseVolumeChartPattern = createMicroserviceEvent('load_data_purchase_volume_chart');

// socket
export const addDataChartEventPattern = 'add_data_chart';
export const refreshProductInfoPattern = 'refresh_product_info';
