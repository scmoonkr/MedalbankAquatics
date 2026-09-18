// types/item.ts
export interface Item {
  itemID: number;
  title: string;
  titleEng: string;
  subtitle: string;
  type: string;
  brand: string;
  category: string;
  size: string;
  price: number;
  url: string;
  thumb: string;
  featured: string;
  images: string[];
  description?: string;

  // size?: string;
  // color?: string;
  // material?: string;
  // stock?: number;
  // isActive?: boolean;
  // createdAt?: string;
  // updatedAt?: string;
}
export interface Collection {
  title: string;
  subtitle: string;
  slug: string;
  description?: string;
  items: Item[];
}

export type ItemList = Item[];

export type ItemSortField = 'itemID' | 'title' | 'brand' | 'category' | 'price' | 'type';

// 값 (런타임)
export const ItemSort = {
  ID: 'itemID' as ItemSortField,
  TITLE: 'title' as ItemSortField,
  BRAND: 'brand' as ItemSortField,
  CATEGORY: 'category' as ItemSortField,
  PRICE: 'price' as ItemSortField,
  TYPE: 'type' as ItemSortField
};

export interface ItemFilter {
  itemID?: number;
  title?: string;
  type?: string;
  brand?: string;
  category?: string;
  gender?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;

  page?: number;
  limit?: number;
  sortField?: string
  sortDirection?: string
}