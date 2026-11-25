export type StoreListProduct = {
  id: number;
  productId: number;
  variantId: number;
  productSlug: string | null;
  productName: string;
  image: string | null;
  originalPrice: number | null;
  finalPrice: number | null;
  discountPercentage?: number;
  rating?: number;
  inStock?: boolean;
  stock?: number;
  isNew?: boolean;
  categoryName?: string | null;
  reviewCount?: number;
};
