export type HomepageBanner = {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  mobileImage: string;
  link: string;
};

export type HomepageCategory = {
  id: number;
  name: string;
  description: string;
  image: string;
  slug: string;
  href: string;
};

export type HomepageProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountAmount?: number;
  discountPercentage?: number;
  appliedOffer?: {
    id: number;
    offerName: string;
    offerSlug: string;
    discountType: string;
    discountValue: number;
  } | null;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
};

export type HomepageBlogPost = {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  href: string;
};

export type HomepageReview = {
  id: number;
  quote: string;
  product: string;
  name: string;
  location: string;
  rating: number;
};

export type HomepageSection = {
  id: number;
  slug?: string | null;
  title: string;
  type: string;
  position: number;
  data: {
    heading: string;
    subHeading: string;
    headingAccent?: string;
    description?: string;
    displayStyle: string;
    /** Hero carousel transition: fade | slide */
    bannerEffect?: "fade" | "slide" | string;
    maxProducts: number;
    /** Manual block key when type is `custom` (e.g. why_choose) */
    customSection?: string;
    sectionName?: string;
  };
  products: HomepageProduct[];
  categories: HomepageCategory[];
  blogs: HomepageBlogPost[];
  banners: HomepageBanner[];
  reviews: HomepageReview[];
};

export type HomepageApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    sections: HomepageSection[];
  };
};
