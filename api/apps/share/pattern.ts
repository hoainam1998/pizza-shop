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
