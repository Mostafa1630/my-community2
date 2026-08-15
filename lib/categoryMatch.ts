import type { Category } from "./types";

export function categoryExistsInList(categories: Category[], categoryId: string) {
  if (!categoryId) return false;
  return categories.some((category) => category.id === categoryId);
}

export function applyCreatorCategoryPrefill(
  categories: Category[],
  categoryId: string | undefined,
  setCategoryId: (value: string) => void,
  setCategoryUnresolved: (value: boolean) => void
) {
  if (!categoryId) {
    setCategoryId("");
    setCategoryUnresolved(true);
    return;
  }

  setCategoryId(categoryId);
  setCategoryUnresolved(!categoryExistsInList(categories, categoryId));
}
