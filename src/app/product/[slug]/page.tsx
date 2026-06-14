import { notFound } from "next/navigation";
import Accordion from "@/components/Accordion";
import ReviewSection from "@/components/ReviewSection";
import ProductDetail from "@/components/ProductDetail/productDetail";
import ProductComboSection from "@/components/sections/ProductComboSection";
import type { ComboProduct } from "@/components/cards/ComboProductCard";
import heroImg from "@/assets/spiritual-hero.jpg";
import booksImg from "@/assets/spiritual-books.jpg";
import rudrakshaImg from "@/assets/rudraksha-collection.jpg";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type ApiAttributeMeta = {
  id: number;
  name: string;
  type?: string;
  isRequired?: boolean;
  isFilterable?: boolean;
};

type ApiProductAttribute = {
  id: number;
  value: string;
  attribute?: ApiAttributeMeta | null;
};

type ApiProductImage = {
  id: number;
  url: string;
  sortOrder: number;
};

type ApiVariantAttribute = {
  id: number;
  value: string;
  attribute?: ApiAttributeMeta | null;
};

type ApiVariant = {
  id: number;
  slug?: string | null;
  name: string;
  price: string | number | null;
  originalPrice?: string | number | null;
  finalPrice?: string | number | null;
  discountAmount?: string | number | null;
  discountPercentage?: string | number | null;
  appliedOffer?: {
    id: number;
    offerName: string;
    offerSlug: string;
    type: string;
    discountValue: string | number;
  } | null;
  offerPrices?: Array<{
    offerId: number;
    offerName: string;
    offerSlug: string;
    type: string;
    discountValue: string | number;
    originalPrice: string | number | null;
    finalPrice: string | number | null;
    discountAmount: string | number | null;
    discountPercentage: string | number | null;
    sources?: string[];
  }>;
  stock?: string | number | null;
  sku?: string | null;
  images?: ApiProductImage[];
  attributes?: ApiVariantAttribute[];
};

type ApiActiveOffer = {
  id: number;
  offerName: string;
  offerSlug: string;
  type: string;
  discountValue: string | number;
  sources?: string[];
};

type ApiFaq = {
  id: number;
  question: string;
  answer: string;
  sortOrder?: number;
};

type ApiReview = {
  id: number;
  userName?: string | null;
  rating?: string | number | null;
  comment?: string | null;
  createdAt?: string;
};

type ReviewItem = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type ApiRelatedProduct = {
  id: number;
  productName: string;
  productSlug: string;
  shortDescription?: string | null;
  image?: string | null;
  price?: number | null;
  inStock?: boolean;
};

type ProductResponseData = {
  id: number;
  productName: string;
  productSlug: string;
  selectedVariantId?: number | null;
  selectedVariantSlug?: string | null;
  shortDescription: string;
  description: string;
  productType?: string;
  brand?: { brandName?: string | null } | null;
  category?: { categoryName?: string | null } | null;
  images?: ApiProductImage[];
  variants?: ApiVariant[];
  attributes?: ApiProductAttribute[];
  faqs?: ApiFaq[];
  reviews?: ApiReview[];
  frequentlyBoughtTogether?: ApiRelatedProduct[];
  activeOffers?: ApiActiveOffer[];
};

type ProductApiResponse = {
  success: boolean;
  message: string;
  data?: ProductResponseData;
  statusCode: number;
};

function getOfferBlurb(offer: ApiActiveOffer): string {
  if (offer.type === "fixed") {
    return `Flat savings of Rs. ${Number(offer.discountValue).toFixed(2)} on this product.`;
  }

  return `Enjoy ${Number(offer.discountValue).toFixed(0)}% off on this product.`;
}

function toNumber(value: string | number | null | undefined): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeAttributes(attributes: ApiProductAttribute[] = []) {
  return attributes
    .filter((attribute) => attribute.attribute?.name && attribute.value)
    .map((attribute) => ({
      id: attribute.id,
      name: attribute.attribute?.name || "Attribute",
      type: attribute.attribute?.type,
      value: attribute.value,
      isRequired: attribute.attribute?.isRequired,
      isFilterable: attribute.attribute?.isFilterable,
    }));
}

function normalizeVariants(variants: ApiVariant[] = []) {
  return variants.map((variant) => ({
    id: variant.id,
    slug: variant.slug || null,
    name: variant.name,
    price: toNumber(variant.price),
    originalPrice: toNumber(variant.originalPrice ?? variant.price),
    finalPrice: toNumber(variant.finalPrice ?? variant.price),
    discountAmount: toNumber(variant.discountAmount) ?? 0,
    discountPercentage: toNumber(variant.discountPercentage) ?? 0,
    appliedOffer: variant.appliedOffer
      ? {
          id: variant.appliedOffer.id,
          offerName: variant.appliedOffer.offerName,
          offerSlug: variant.appliedOffer.offerSlug,
          type: variant.appliedOffer.type,
          discountValue: Number(variant.appliedOffer.discountValue),
        }
      : null,
    offerPrices: (variant.offerPrices || [])
      .map((offerPrice) => ({
        offerId: offerPrice.offerId,
        offerName: offerPrice.offerName,
        offerSlug: offerPrice.offerSlug,
        type: offerPrice.type,
        discountValue: Number(offerPrice.discountValue),
        originalPrice: toNumber(offerPrice.originalPrice),
        finalPrice: toNumber(offerPrice.finalPrice),
        discountAmount: toNumber(offerPrice.discountAmount) ?? 0,
        discountPercentage: toNumber(offerPrice.discountPercentage) ?? 0,
        sources: offerPrice.sources || [],
      }))
      .sort((left, right) => {
        const leftPrice = left.finalPrice ?? Number.POSITIVE_INFINITY;
        const rightPrice = right.finalPrice ?? Number.POSITIVE_INFINITY;

        if (leftPrice !== rightPrice) {
          return leftPrice - rightPrice;
        }

        return right.discountAmount - left.discountAmount;
      }),
    stock: toNumber(variant.stock),
    sku: variant.sku || null,
    images: (variant.images || [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => image.url),
    attributes: (variant.attributes || [])
      .filter((attribute) => attribute.attribute?.name && attribute.value)
      .map((attribute) => ({
        attributeId: attribute.attribute?.id || attribute.id,
        name: attribute.attribute?.name || "Option",
        type: attribute.attribute?.type,
        value: attribute.value,
      })),
  }));
}

async function getProductBySlug(slug: string): Promise<ProductResponseData | null> {
  const safeSlug = encodeURIComponent(slug);
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.vrindavanrasa.com/backend/api";

  try {
    const res = await fetch(`${API_BASE}/customer/products/${safeSlug}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return null;
    }

    const json = (await res.json()) as ProductApiResponse;
    if (json.success && json.data) {
      return json.data;
    }
  } catch {
    return null;
  }

  return null;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return notFound();
  }

  const baseImages =
    product.images?.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((image) => image.url) ?? [];
  const normalizedVariants = normalizeVariants(product.variants || []);
  const reviewList: ReviewItem[] = (product.reviews || []).map((review) => ({
    id: String(review.id),
    userName: review.userName || "Customer",
    rating: toNumber(review.rating) || 0,
    comment: review.comment || "",
    date: review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN") : "",
  }));
  const validRatings = reviewList.map((review) => review.rating).filter((rating) => rating > 0);
  const averageRating = validRatings.length
    ? Number((validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length).toFixed(1))
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
    attributes: normalizeAttributes(product.attributes || []),
    variants: normalizedVariants,
    activeOffers: (product.activeOffers || []).map((offer) => ({
      id: offer.id,
      offerName: offer.offerName,
      offerSlug: offer.offerSlug,
      type: offer.type,
      discountValue: Number(offer.discountValue),
      sources: offer.sources || [],
    })),
    rating: averageRating,
    reviewCount: reviewList.length,
  };

  const faqItems: FaqItem[] =
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

  const comboFallbackImages = [booksImg.src, rudrakshaImg.src, heroImg.src];
  const comboProducts: ComboProduct[] =
    product.frequentlyBoughtTogether && product.frequentlyBoughtTogether.length > 0
      ? product.frequentlyBoughtTogether.map((item, index) => ({
        id: String(item.id),
        name: item.productName,
        description:
          item.shortDescription || "A complementary product often chosen together with this item.",
        price: item.price || 0,
        image: item.image || comboFallbackImages[index % comboFallbackImages.length],
        category: "Recommended",
        rating: 5,
        reviewCount: 0,
        inStock: item.inStock ?? true,
      }))
      : [
        {
          id: "combo-fallback-1",
          name: `${product.productName} Pairing Pack`,
          description: "A carefully matched add-on bundle that complements this product.",
          price: 199,
          image: comboFallbackImages[0],
          category: "Recommended",
          rating: 5,
          reviewCount: 0,
          inStock: true,
        },
      ];

  return (
    <div className="container product-page-shell" style={{ paddingTop: "1.25rem", paddingBottom: "3rem" }}>
      <div className="product-breadcrumbs">
        <a href="/">Home</a>
        <span>›</span>
        <a href="/store">{product.category?.categoryName || "Store"}</a>
        <span>›</span>
        <span className="is-current">{product.productName}</span>
      </div>

      <ProductDetail
        product={detailProduct}
        fallbackImages={baseImages.length > 0 ? baseImages : [heroImg.src, rudrakshaImg.src]}
      />

      <section className="product-section-block product-copy-block">
        <h2 className="product-section-heading">Product Description</h2>
        <div
          className="product-copy-content"
          dangerouslySetInnerHTML={{ __html: detailProduct.descriptionHtml }}
        />
      </section>

      <section className="product-section-block faq-section product-faq-block" style={{ marginTop: "2.25rem" }}>
        <h2 className="section-title product-faq-heading" style={{ marginBottom: "1rem" }}>
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
          viewAllLink="/store"
        />
      </div>
    </div>
  );
}
