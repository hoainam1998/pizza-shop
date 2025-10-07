import prisma from 'generated/prisma';

type CategoryMockType = {
  category_id: string;
  avatar: string;
  name: string;
  _count?: any;
};

export const category: CategoryMockType = {
  category_id: Date.now().toString(),
  avatar: 'avatar',
  name: 'category name',
  _count: {
    product: 0,
  },
};

export const createCategoryList = (length: number, includeCount: boolean = true): prisma.category[] => {
  if (!includeCount) {
    delete category._count;
  }
  return Array.apply(this, Array(length)).map(() => category);
};
