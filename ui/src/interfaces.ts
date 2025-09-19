export type TableFieldType = {
  key: string;
  label?: string;
  width?: number;
};

export type MessageResponse = {
  message: string;
};

export type Ingredient = {
  ingredientId: string;
  name?: string;
  avatar?: string;
  amount?: number;
  unit?: string;
  units?: string[];
};

export type OptionType = {
  value: string;
  label: string;
};

export type CategoryType = {
  categoryId: string;
  name: string;
  avatar: string;
}
