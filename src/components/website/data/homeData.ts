import {
  WEBSITE_IMAGES,
  seedToWebsiteProduct,
  SEED_PRODUCTS,
} from "@/components/website/data/products";
import type { ComboProduct } from "@/components/website/cards/ComboProductCard";
import type { WebsiteProductCardData } from "@/components/website/cards/ProductCard";

const rudrakshaProducts: WebsiteProductCardData[] = SEED_PRODUCTS.filter(
  (p) => p.category === "rudraksha"
).map(seedToWebsiteProduct);

const bookProducts: ComboProduct[] = SEED_PRODUCTS.filter(
  (p) => p.category === "books"
).map((item) => ({
  id: item.id,
  name: item.title,
  description: item.description || "",
  price: item.price,
  originalPrice: item.originalPrice,
  image: item.image,
  category: "Books",
  rating: item.rating,
  reviewCount: 0,
  inStock: true,
}));

export const homeCategories = [
  {
    id: 1,
    name: "Rudraksha Collection",
    description:
      "Authentic blessed beads from the holy lands for spiritual growth and divine protection",
    image: WEBSITE_IMAGES.rudraksha,
    productCount: 12,
    href: "/rudraksha",
  },
  {
    id: 2,
    name: "Divine Sweets & Prasadam",
    description:
      "Traditional blessed sweets prepared with devotion and served as sacred offerings",
    image: WEBSITE_IMAGES.sweets,
    productCount: 18,
    href: "/sweets",
  },
  {
    id: 3,
    name: "Sacred Books & Literature",
    description:
      "Holy texts, spiritual guides, and devotional literature for your spiritual journey",
    image: WEBSITE_IMAGES.books,
    productCount: 8,
    href: "/books",
  },
  {
    id: 4,
    name: "Rashi & Zodiac Items",
    description:
      "Personalized spiritual items based on your zodiac sign and birth chart",
    image: WEBSITE_IMAGES.rashi,
    productCount: 15,
    href: "/rashi",
  },
  {
    id: 5,
    name: "Puja Essentials",
    description:
      "Incense, diyas, thalis, and sacred items for daily worship and rituals",
    image: WEBSITE_IMAGES.rudraksha,
    productCount: 6,
    href: "/shop",
  },
  {
    id: 6,
    name: "Gift Hampers",
    description:
      "Curated spiritual gift sets for festivals, blessings, and special occasions",
    image: WEBSITE_IMAGES.sweets,
    productCount: 4,
    href: "/shop",
  },
];

export const homeBlogPosts = [
  {
    id: 1,
    category: "Spirituality",
    date: "Mar 10, 2026",
    title: "The Ultimate Guide to Rudraksha Beads",
    excerpt:
      "Learn how to choose authentic rudraksha and care for your sacred mala.",
    image: WEBSITE_IMAGES.rudraksha,
    href: "/shop",
  },
  {
    id: 2,
    category: "Devotion",
    date: "Mar 5, 2026",
    title: "5 Sacred Items Every Home Altar Needs",
    excerpt:
      "Discover essential spiritual items to create a peaceful sacred space.",
    image: WEBSITE_IMAGES.sweets,
    href: "/shop",
  },
  {
    id: 3,
    category: "Wellness",
    date: "Feb 28, 2026",
    title: "Benefits of Daily Meditation Practice",
    excerpt:
      "How rudraksha, incense, and sacred texts support your meditation journey.",
    image: WEBSITE_IMAGES.books,
    href: "/shop",
  },
];

export const homeReviews = [
  {
    id: 1,
    quote:
      '"The rudraksha quality is exceptional. Authentic beads and beautiful packaging."',
    product: "5 Mukhi Rudraksha",
    name: "Priya S.",
    location: "Delhi, India",
    rating: 5,
  },
  {
    id: 2,
    quote:
      '"Best spiritual sweets I have ordered online. Fresh, blessed, and delivered quickly."',
    product: "Mathura Peda",
    name: "Rajesh K.",
    location: "Mumbai, India",
    rating: 5,
  },
  {
    id: 3,
    quote:
      '"Sacred books arrived in perfect condition. Will definitely order again."',
    product: "Bhagavad Gita",
    name: "Anita M.",
    location: "Bangalore, India",
    rating: 5,
  },
  {
    id: 4,
    quote: '"Great selection and fair prices. Very satisfied with my rashi yantra."',
    product: "Rashi Yantra",
    name: "Vikram P.",
    location: "Jaipur, India",
    rating: 4,
  },
];

export { rudrakshaProducts, bookProducts };
