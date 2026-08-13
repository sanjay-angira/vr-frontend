import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
import { JsonLd } from "@/components/website/seo/JsonLd";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import {
  getBreadcrumbSchema,
  getFaqPageSchema,
  getProductSchema,
} from "@/lib/schema";
import { getProductPageMetadata } from "@/lib/seo";
import { buildProductVariantUrl } from "@/components/website/product/productVariantUtils";
import { getProductWebpImageUrl } from "@/utils/optimizedImage";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ variant?: string | string[] }>;
};

function pickVariantParam(
  value: string | string[] | undefined,
): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === "string" && item.trim());
    return first?.trim() || null;
  }
  return null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return { title: "Product not found | Vrindavan Rasa" };
  }

  const name = product.productName?.trim() || "Product";
  const image =
    product.images
      ?.slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) =>
        getProductWebpImageUrl(
          {
            originalUrl: item.originalUrl || item.url,
            url: item.originalUrl || item.url,
            webp400: item.webp400,
            webp800: item.webp800,
            webp1200: item.webp1200,
          },
          1200,
        ),
      )
      .find((url) => typeof url === "string" && url.trim()) || null;

  const description =
    product.shortDescription?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ||
    undefined;

  return getProductPageMetadata(name, {
    slug: product.productSlug || slug,
    description,
    image,
  });
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : undefined;
  const variantFromQuery = pickVariantParam(query?.variant);

  // Start coupons immediately; product fetch is deduped with generateMetadata via cache().
  const productPromise = fetchProductBySlug(slug);
  const couponsPromise = fetchWebsiteCoupons();
  const product = await productPromise;

  if (!product) {
    notFound();
  }

  // Cards / bookmarks may hit /product/{variantSlug}. Canonicalize immediately
  // so the address bar does not jump after client hydrate.
  if (product.productSlug && slug !== product.productSlug) {
    redirect(buildProductVariantUrl(product.productSlug, slug));
  }

  const categoryId = Number(product.category?.id);
  const [availableCoupons, recommendedProducts] = await Promise.all([
    couponsPromise,
    Number.isFinite(categoryId) && categoryId > 0
      ? fetchSameCategoryProducts({
          categoryId,
          excludeProductId: product.id,
          limit: 8,
        })
      : Promise.resolve([]),
  ]);

  const normalizedVariants = normalizeVariants(
    product.variants as Parameters<typeof normalizeVariants>[0]
  );

  const requestedVariantSlug = variantFromQuery;

  const baseImages =
    product.images
      ?.slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) =>
        getProductWebpImageUrl(
          {
            originalUrl: image.originalUrl || image.url,
            url: image.originalUrl || image.url,
            webp400: image.webp400,
            webp800: image.webp800,
            webp1200: image.webp1200,
          },
          1200,
        ),
      )
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
    : undefined;

  const primaryVariant =
    (requestedVariantSlug
      ? normalizedVariants.find((v) => v.slug === requestedVariantSlug)
      : null) ||
    normalizedVariants[0] ||
    null;

  const productPath = `/product/${product.productSlug || slug}`;
  const plainDescription =
    product.shortDescription?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ||
    product.description?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ||
    undefined;

  const offerPrice =
    primaryVariant?.pricing.finalPrice ??
    primaryVariant?.pricing.sellingPrice ??
    primaryVariant?.price ??
    null;

  const schemas: Array<Record<string, unknown>> = [
    getProductSchema({
      name: product.productName,
      description: plainDescription,
      images: baseImages,
      sku: primaryVariant?.sku,
      brandName: product.brand?.brandName,
      price: offerPrice,
      inStock: primaryVariant ? Number(primaryVariant.stock) > 0 : undefined,
      path: productPath,
      ratingValue: averageRating,
      reviewCount: reviewList.length,
    }),
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      ...(categorySlug && product.category?.categoryName
        ? [
            {
              name: product.category.categoryName,
              path: `/category/${categorySlug}`,
            },
          ]
        : [{ name: "Shop", path: "/products" }]),
      { name: product.productName, path: productPath },
    ]),
  ];

  const productFaqSchema = getFaqPageSchema(
    faqItems.map((item) => ({ question: item.question, answer: item.answer }))
  );
  if (productFaqSchema) schemas.push(productFaqSchema);

  return (
    <>
      <JsonLd data={schemas} />
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
