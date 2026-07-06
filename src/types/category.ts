// Canonical Category type — single source of truth shared by the server-only
// data layer (src/lib/queries.ts) and any client components. Supersedes the
// locally-redeclared `Category` interfaces that previously lived in
// src/actions/actions.ts and src/app/_components/Collections.tsx.

export interface Category {
  id: string;
  categoryName: string;
  description?: string;
  active?: boolean;
  isSubcategory?: boolean;
  slug?: string;
  order?: number;
  images?: string[];
  desktopBanner?: string | null;
  mobileBanner?: string | null;
  parentCategory?: { categoryId: string; categoryName: string };
  subCategories?: string[];
  // Stored form is an array of product IDs. Hydrated `products: Product[]`
  // for display lives on a SEPARATE return shape (e.g. getCollectionsWithProducts),
  // not on Category itself — do not overload this field.
  products?: string[];
  createdDate?: unknown;
  updatedDate?: unknown;
}
