import { ProductDetailSkeleton } from "@/components/shared/ProductDetailSkeleton";
import { ScrollToTopOnMount } from "@/components/shared/ScrollToTopOnMount";

export default function Loading() {
  return (
    <>
      <ScrollToTopOnMount />
      <ProductDetailSkeleton />
    </>
  );
}
