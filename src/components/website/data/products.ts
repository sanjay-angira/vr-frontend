export const WEBSITE_IMAGES = {
  hero:
    "https://images.unsplash.com/photo-1604608672516-3e98ee5a3b0e?auto=format&fit=crop&w=1600&q=80",
  rudraksha:
    "https://images.unsplash.com/photo-1604608672516-3e98ee5a3b0e?auto=format&fit=crop&w=800&q=80",
  sweets:
    "https://images.unsplash.com/photo-1587241321921-91a2d83705f5?auto=format&fit=crop&w=800&q=80",
  books:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  rashi:
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
} as const;

export type WebsiteProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  benefits?: string[];
  slug?: string;
};

export type SeedProduct = {
  id: string;
  slug?: string;
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  description?: string;
  category?: string;
};

export const SEED_PRODUCTS: SeedProduct[] = [
  { id: "1", title: "5 Mukhi Rudraksha", image: WEBSITE_IMAGES.rudraksha, price: 299, originalPrice: 399, rating: 5, description: "Authentic Nepal Rudraksha for peace and prosperity", category: "rudraksha" },
  { id: "2", title: "7 Mukhi Rudraksha", image: WEBSITE_IMAGES.rudraksha, price: 599, originalPrice: 799, rating: 5, description: "Sacred bead for wealth and abundance", category: "rudraksha" },
  { id: "3", title: "Rudraksha Mala 108 Beads", image: WEBSITE_IMAGES.rudraksha, price: 1299, originalPrice: 1599, rating: 5, description: "Complete mala for meditation and chanting", category: "rudraksha" },
  { id: "4", title: "1 Mukhi Rudraksha", image: WEBSITE_IMAGES.rudraksha, price: 2999, originalPrice: 3999, rating: 5, description: "Rare and powerful bead for spiritual enlightenment", category: "rudraksha" },
  { id: "5", title: "Mathura Peda", image: WEBSITE_IMAGES.sweets, price: 199, originalPrice: 259, rating: 5, description: "Traditional blessed sweets from Mathura", category: "sweets" },
  { id: "6", title: "Kesar Peda", image: WEBSITE_IMAGES.sweets, price: 299, originalPrice: 359, rating: 5, description: "Saffron-infused divine sweets", category: "sweets" },
  { id: "7", title: "Mishri Dana", image: WEBSITE_IMAGES.sweets, price: 99, originalPrice: 129, rating: 4, description: "Pure rock candy for offerings", category: "sweets" },
  { id: "8", title: "Coconut Laddu", image: WEBSITE_IMAGES.sweets, price: 179, originalPrice: 229, rating: 5, description: "Fresh coconut blessed sweets", category: "sweets" },
  { id: "9", title: "Ramayana - Complete Edition", image: WEBSITE_IMAGES.books, price: 499, originalPrice: 699, rating: 5, description: "Complete epic with beautiful illustrations", category: "books" },
  { id: "10", title: "Bhagavad Gita", image: WEBSITE_IMAGES.books, price: 299, originalPrice: 399, rating: 5, description: "Sacred text with commentary", category: "books" },
  { id: "11", title: "Hanuman Chalisa", image: WEBSITE_IMAGES.books, price: 99, originalPrice: 149, rating: 5, description: "Devotional hymns and prayers", category: "books" },
  { id: "12", title: "Mahabharata Set", image: WEBSITE_IMAGES.books, price: 1299, originalPrice: 1799, rating: 5, description: "Complete epic in beautiful binding", category: "books" },
  { id: "13", title: "Aries Rashi Yantra", image: WEBSITE_IMAGES.rashi, price: 399, originalPrice: 599, rating: 5, description: "Sacred geometry for Aries zodiac", category: "rashi" },
  { id: "14", title: "Leo Rashi Pendant", image: WEBSITE_IMAGES.rashi, price: 599, originalPrice: 799, rating: 5, description: "Golden pendant for Leo natives", category: "rashi" },
  { id: "15", title: "Complete Rashi Chart", image: WEBSITE_IMAGES.rashi, price: 999, originalPrice: 1299, rating: 5, description: "All 12 zodiac symbols in sacred design", category: "rashi" },
  { id: "16", title: "Personalized Rashi Stone", image: WEBSITE_IMAGES.rashi, price: 799, originalPrice: 999, rating: 4, description: "Gemstone based on your birth chart", category: "rashi" },
];

export function seedToWebsiteProduct(item: SeedProduct): WebsiteProduct {
  return {
    id: item.id,
    name: item.title,
    description: item.description || "",
    price: item.price,
    originalPrice: item.originalPrice,
    image: item.image,
    category: item.category || "store",
    rating: item.rating,
    reviewCount: 0,
    inStock: true,
    slug: item.slug,
  };
}

export function getProductsByCategory(category: string): WebsiteProduct[] {
  return SEED_PRODUCTS.filter((item) => item.category === category).map(
    seedToWebsiteProduct
  );
}
