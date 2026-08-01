import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopPageContent } from "@/components/website/shop/ShopPageContent";

export const metadata: Metadata = {
  title: "Shop | Vrindavan Rasa",
  description: "Browse all products from Vrindavan Rasa.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<section className="store-catalog" aria-busy="true" />}>
      <ShopPageContent />
    </Suspense>
  );
}
