import { Types } from 'mongoose';

export type MenuCategory =
  | 'beer-local'
  | 'beer-imported'
  | 'beer-craft'
  | 'wine'
  | 'soft-drinks'
  | 'starters'
  | 'main-courses'
  | 'desserts';

export type MenuMainCategory = 'drinks' | 'food';

export interface ICustomizationOption {
  name: string;
  price: number;
  available: boolean;
}

export interface ICustomization {
  name: string;
  required: boolean;
  options: ICustomizationOption[];
}

export interface IMenuItem {
  _id: Types.ObjectId;
  name: string;
  description: string;
  mainCategory: MenuMainCategory;
  category: MenuCategory;
  price: number;
  images: string[];
  customizations: ICustomization[];
  isAvailable: boolean;
  preparationTime: number;
  tags: string[];
  allergens: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
