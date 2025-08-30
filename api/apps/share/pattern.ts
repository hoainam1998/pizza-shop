import { createMicroserviceEvent } from './utils';

export const createCategoryPattern = createMicroserviceEvent('create');
export const paginationCategoryPattern = createMicroserviceEvent('pagination');
export const updateCategoryPattern = createMicroserviceEvent('update');
export const deleteCategoryPattern = createMicroserviceEvent('delete');
