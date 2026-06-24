import Link from "next/link";
import { notFound } from "next/navigation";
import { Accordion } from "@/components/website/shared/Accordion";
import ReviewSection from "@/components/website/product/ReviewSection";
import ProductDetail from "@/components/website/product/ProductDetail";
import { ProductComboSection } from "@/components/website/sections/ProductComboSection";
import type { ComboProduct } from "@/components/website/cards/ComboProductCard";
import { WEBSITE_IMAGES } from "@/components/website/data/products";
import {
  fetchProductBySlug,
  normalizeAttributes,
  normalizeVariants,
  toNumber,
} from "@/components/website/product/productApi";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const baseImages =
    product.images
      ?.slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => image.url) ?? [];

  const normalizedVariants = normalizeVariants(
    product.variants as Parameters<typeof normalizeVariants>[0]
  );

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
    selectedVariantId: product.selectedVariantId ?? null,
    shortDescription: product.shortDescription || "",
    descriptionHtml: (product.description || product.shortDescription || "").trim(),
    brandName: product.brand?.brandName || null,
    categoryName: product.category?.categoryName || null,
    productType: product.productType || null,
    baseImages,
    attributes: normalizeAttributes(
      product.attributes as Parameters<typeof normalizeAttributes>[0]
    ),
    variants: normalizedVariants,
    activeOffers: (product.activeOffers || []).map((offer) => ({
      id: Number(offer.id),
      offerName: String(offer.offerName),
      offerSlug: String(offer.offerSlug),
      type: String(offer.type),
      discountValue: Number(offer.discountValue),
      sources: (offer.sources as string[]) || [],
    })),
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
      : [
          {
            id: "shipping",
            question: "How soon will my order arrive?",
            answer:
              "Orders are typically dispatched within 24-48 hours and delivered in 3-7 business days depending on your location.",
          },
          {
            id: "storage",
            question: "How should I store this product?",
            answer:
              "Store it in a cool, dry place away from direct sunlight to preserve freshness, aroma, and quality.",
          },
          {
            id: "returns",
            question: "Can I return this item?",
            answer:
              "Unused items in original condition can be returned within 7 days of delivery unless the product is marked non-returnable.",
          },
        ];

  const comboFallbackImages = [
    WEBSITE_IMAGES.books,
    WEBSITE_IMAGES.rudraksha,
    WEBSITE_IMAGES.hero,
  ];

  const comboProducts: ComboProduct[] =
    product.frequentlyBoughtTogether &&
    product.frequentlyBoughtTogether.length > 0
      ? product.frequentlyBoughtTogether.map((item, index) => ({
          id: String(item.id),
          name: item.productName,
          description:
            item.shortDescription ||
            "A complementary product often chosen together with this item.",
          price: item.price || 0,
          image:
            item.image || comboFallbackImages[index % comboFallbackImages.length],
          category: "Recommended",
          rating: 5,
          reviewCount: 0,
          inStock: item.inStock ?? true,
        }))
      : [
          {
            id: "combo-fallback-1",
            name: `${product.productName} Pairing Pack`,
            description:
              "A carefully matched add-on bundle that complements this product.",
            price: 199,
            image: comboFallbackImages[0],
            category: "Recommended",
            rating: 5,
            reviewCount: 0,
            inStock: true,
          },
        ];

  return (
    <div
      className="container product-page-shell"
      style={{ paddingTop: "1.25rem", paddingBottom: "3rem" }}
    >
      <div className="product-breadcrumbs">
        <Link href="/">Home</Link>
        <span>›</span>
        <Link href="/shop">{product.category?.categoryName || "Shop"}</Link>
        <span>›</span>
        <span className="is-current">{product.productName}</span>
      </div>

      <ProductDetail
        product={detailProduct}
        fallbackImages={
          baseImages.length > 0
            ? baseImages
            : [WEBSITE_IMAGES.hero, WEBSITE_IMAGES.rudraksha]
        }
      />

      <section className="product-section-block product-copy-block">
        <h2 className="product-section-heading">Product Description</h2>
        <div
          className="product-copy-content"
          dangerouslySetInnerHTML={{ __html: detailProduct.descriptionHtml }}
        />
      </section>

      <section
        className="product-section-block faq-section product-faq-block"
        style={{ marginTop: "2.25rem" }}
      >
        <h2
          className="section-title product-faq-heading"
          style={{ marginBottom: "1rem" }}
        >
          Frequently Asked Questions
        </h2>
        <Accordion items={faqItems} className="product-faq-accordion" />
      </section>

      <div style={{ marginTop: "3rem" }}>
        <ReviewSection productId={product.productSlug} reviews={reviewList} />
      </div>

      <div className="product-related-wrap" style={{ marginTop: "3.5rem" }}>
        <ProductComboSection
          title="You May Also Like"
          comboProducts={comboProducts}
          viewAllLink="/shop"
        />
      </div>
    </div>
  );
}
