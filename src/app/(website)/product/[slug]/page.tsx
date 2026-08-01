import Link from "next/link";
import { notFound } from "next/navigation";
import { Accordion } from "@/components/website/shared/Accordion";
import ReviewSection from "@/components/website/product/ReviewSection";
import ProductDetail from "@/components/website/product/ProductDetail";
import { ProductSection } from "@/components/website/sections/ProductSection";
import {
  fetchProductBySlug,
  fetchSameCategoryProducts,
  normalizeAttributes,
  normalizeVariants,
  toNumber,
} from "@/components/website/product/productApi";
import { fetchWebsiteCoupons } from "@/services/website/couponService";
import { ShopSeedLink } from "@/components/website/shop/ShopSeedLink";
import { ScrollToTopOnMount } from "@/components/website/shared/ScrollToTopOnMount";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, availableCoupons] = await Promise.all([
    fetchProductBySlug(slug),
    fetchWebsiteCoupons(),
  ]);

  if (!product) {
    notFound();
  }

  const categoryId = Number(product.category?.id);
  const recommendedProducts =
    Number.isFinite(categoryId) && categoryId > 0
      ? await fetchSameCategoryProducts({
          categoryId,
          excludeProductId: product.id,
          limit: 8,
        })
      : [];

  const normalizedVariants = normalizeVariants(
    product.variants as Parameters<typeof normalizeVariants>[0]
  );

  const requestedVariantSlug =
    slug !== product.productSlug
      ? slug
      : null;

  const baseImages =
    product.images
      ?.slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => image.url)
      .filter((url): url is string => typeof url === "string" && url.trim().length > 0) ?? [];

  const reviewList = (product.reviews || []).map((review) => ({
    id: String(review.id),
    userName: review.userName || "Customer",
    rating: toNumber(review.rating) || 0,
    comment: review.comment || "",
    date: review.createdAt
      ? new Date(review.createdAt).toLocaleDateString("en-IN")
      : "",
  }));

  const validRatings = reviewList
    .map((review) => review.rating)
    .filter((rating) => rating > 0);
  const averageRating = validRatings.length
    ? Number(
        (
          validRatings.reduce((sum, rating) => sum + rating, 0) /
          validRatings.length
        ).toFixed(1)
      )
    : 0;

  const detailProduct = {
    id: product.id,
    title: product.productName,
    slug: product.productSlug,
    shortDescription: product.shortDescription || "",
    brandName: product.brand?.brandName || null,
    categoryName: product.category?.categoryName || null,
    baseImages,
    attributes: normalizeAttributes(
      (product.attributes as Parameters<typeof normalizeAttributes>[0]) ?? [],
      (product.productAttributes as Parameters<typeof normalizeAttributes>[1]) ?? []
    ),
    variants: normalizedVariants,
    rating: averageRating,
    reviewCount: reviewList.length,
    availableCoupons,
  };

  const faqItems =
    product.faqs && product.faqs.length > 0
      ? product.faqs
          .slice()
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .map((faq) => ({
            id: String(faq.id),
            question: faq.question,
            answer: faq.answer,
          }))
      : [];

  const recommendedCards = recommendedProducts.map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    description: item.description,
    price: item.price,
    originalPrice: item.originalPrice,
    image: resolveImageUrl(item.image),
    category: item.category || product.category?.categoryName || "",
    rating: item.rating,
    reviewCount: item.reviewCount,
    inStock: item.inStock,
  }));

  const categorySlug = product.category?.categorySlug?.trim();
  const categoryShopSeed = categorySlug
    ? { categorySlugs: [categorySlug] }
    : Number.isFinite(categoryId) && categoryId > 0
      ? { categoryIds: [categoryId] }
      : undefined;

  return (
    <>
      <div className="container product-page-shell">
        <ScrollToTopOnMount />

        <div className="product-breadcrumbs">
          <Link href="/">Home</Link>
          <span>›</span>
          <ShopSeedLink seed={categoryShopSeed}>
            {product.category?.categoryName || "Shop"}
          </ShopSeedLink>
          <span>›</span>
          <span className="is-current">{product.productName}</span>
        </div>

        <ProductDetail
          product={detailProduct}
          fallbackImages={baseImages}
          initialVariantSlug={requestedVariantSlug}
        />

        {(product.description || product.shortDescription) && (
          <section className="product-section-block product-copy-block">
            <h2 className="product-section-heading">Product Description</h2>
            <div
              className="product-copy-content rich-html"
              dangerouslySetInnerHTML={{
                __html: (product.description || product.shortDescription || "").trim(),
              }}
            />
          </section>
        )}

        {faqItems.length > 0 && (
          <section
            className="product-section-block faq-section product-faq-block"
            style={{ marginTop: "2.25rem" }}
          >
            <h2 className="product-section-heading" style={{ marginBottom: "1rem" }}>
              Frequently Asked Questions
            </h2>
            <Accordion items={faqItems} className="product-faq-accordion" />
          </section>
        )}

        <div className="product-reviews-wrap">
          <ReviewSection productId={product.productSlug} reviews={reviewList} />
        </div>
      </div>

      {recommendedCards.length > 0 && (
        <ProductSection
          heading={{
            title: "You May Also Like",
            accent: "Like",
            eyebrow: "RECOMMENDED FOR YOU",
            description: product.category?.categoryName
              ? `More from ${product.category.categoryName}`
              : "Products from the same category",
          }}
          products={recommendedCards}
          viewAllLink="/products"
          viewAllSeed={categoryShopSeed}
        />
      )}
    </>
  );
}
