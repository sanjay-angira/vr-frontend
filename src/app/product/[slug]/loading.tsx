import { ProductDetailSkeleton } from "@/components/website/shared/ProductDetailSkeleton";
import { ScrollToTopOnMount } from "@/components/website/shared/ScrollToTopOnMount";

export default function Loading() {
  return (
    <>
      <ScrollToTopOnMount />
      <ProductDetailSkeleton />
    </>
  );
}
