
export enum Category {
  ENTREE = 'Entrée',
  PLAT = 'Plat Principal',
  DESSERT = 'Dessert',
  SNACK = 'Snack',
  BOISSON = 'Boisson'
}

export interface Recipe {
  id: string;
  title: string;
  category: Category;
  ingredients: string[];
  instructions: string[];
  image?: string;
  createdAt: number;
  isFavorite?: boolean;
  prepTime?: string; // e.g., "30 min"
  videoUrl?: string;
  rating?: number; // 0 to 5
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    advice?: string;
  };
}

export interface SuggestedRecipe {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  prepTime: string;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    advice?: string;
  };
}
