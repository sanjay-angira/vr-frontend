import Link from "next/link";
import { notFound } from "next/navigation";
import { Accordion } from "@/components/website/shared/Accordion";
import ReviewSection from "@/components/website/product/ReviewSection";
import ProductDetail from "@/components/website/product/ProductDetail";
import { ProductComboSection } from "@/components/website/sections/ProductComboSection";
import type { ComboProduct } from "@/components/website/cards/ComboProductCard";
import {
  fetchProductBySlug,
  normalizeAttributes,
  normalizeVariants,
  toNumber,
} from "@/components/website/product/productApi";
import { ScrollToTopOnMount } from "@/components/website/shared/ScrollToTopOnMount";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

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
      .map((image) => image.url) ?? [];

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

  const comboProducts: ComboProduct[] =
    product.frequentlyBoughtTogether && product.frequentlyBoughtTogether.length > 0
      ? product.frequentlyBoughtTogether.map((item) => ({
          id: String(item.id),
          name: item.productName,
          description: item.shortDescription || "",
          price: item.price || 0,
          image: item.image || "",
          category: "Recommended",
          rating: 5,
          reviewCount: 0,
          inStock: item.inStock ?? true,
        }))
      : [];

  return (
    <div
      className="container product-page-shell"
      style={{ paddingTop: "1.25rem", paddingBottom: "3rem" }}
    >
      <ScrollToTopOnMount />

      <div className="product-breadcrumbs">
        <Link href="/">Home</Link>
        <span>›</span>
        <Link href="/products">{product.category?.categoryName || "Shop"}</Link>
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
          <h2 className="section-title product-copy-heading">Product Description</h2>
          <div
            className="product-copy-content rich-html"
            dangerouslySetInnerHTML={{
              __html: (product.description || product.shortDescription || "").trim(),
            }}
          />
        </section>
      )}

      {faqItems.length > 0 && (
        <section className="product-section-block product-faq-block">
          <div className="product-faq-intro">
            <h2 className="product-section-heading product-faq-heading">
              Frequently Asked Questions
            </h2>
            <p className="product-faq-subcopy">
              Quick answers about this product, ingredients, and usage.
            </p>
          </div>
          <Accordion items={faqItems} className="product-faq-accordion" />
        </section>
      )}

      <div style={{ marginTop: "3rem" }}>
        <ReviewSection productId={product.productSlug} reviews={reviewList} />
      </div>

      {comboProducts.length > 0 && (
        <div className="product-related-wrap" style={{ marginTop: "3.5rem" }}>
          <ProductComboSection
            title="You May Also Like"
            comboProducts={comboProducts}
            viewAllLink="/shop"
          />
        </div>
      )}
    </div>
  );
}
