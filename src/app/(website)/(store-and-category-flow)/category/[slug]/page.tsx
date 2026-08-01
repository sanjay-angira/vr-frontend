import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopPageContent } from "@/components/website/shop/ShopPageContent";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const label = slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    title: `${label || "Category"} | Vrindavan Rasa`,
    description: `Shop ${label || "products"} from Vrindavan Rasa.`,
  };
}

export default async function CategoryShopPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<section className="store-catalog" aria-busy="true" />}>
      <ShopPageContent categorySlug={slug} />
    </Suspense>
  );
}
