import rudrakshaImg from "@/assets/rudraksha-collection.jpg";
import sweetsImg from "@/assets/spiritual-sweets.jpg";
import booksImg from "@/assets/spiritual-books.jpg";
import rashiImg from "@/assets/rashi-logos.jpg";
export type Product = {
  id: string;
  slug?: string;
  title: string;
  image: any;
  price: number;
  originalPrice?: number;
  rating: number;
  description?: string;
  category?: string;
};

// Seeded to mirror home sections so the PDP can work without a backend yet
export const PRODUCTS: Product[] = [
  {
    id: "1",
    title: "5 Mukhi Rudraksha",
    image: rudrakshaImg,
    price: 299,
    originalPrice: 399,
    rating: 5,
    description: "Authentic Nepal Rudraksha for peace and prosperity",
    category: "rudraksha"
  },
  {
    id: "2",
    title: "7 Mukhi Rudraksha",
    image: rudrakshaImg,
    price: 599,
    originalPrice: 799,
    rating: 5,
    description: "Sacred bead for wealth and abundance",
    category: "rudraksha"
  },
  {
    id: "3",
    title: "Rudraksha Mala 108 Beads",
    image: rudrakshaImg,
    price: 1299,
    originalPrice: 1599,
    rating: 5,
    description: "Complete mala for meditation and chanting",
    category: "rudraksha"
  },
  {
    id: "4",
    title: "1 Mukhi Rudraksha",
    image: rudrakshaImg,
    price: 2999,
    originalPrice: 3999,
    rating: 5,
    description: "Rare and powerful bead for spiritual enlightenment",
    category: "rudraksha"
  },
  {
    id: "5",
    title: "Mathura Peda",
    image: sweetsImg,
    price: 199,
    originalPrice: 259,
    rating: 5,
    description: "Traditional blessed sweets from Mathura",
    category: "sweets"
  },
  {
    id: "6",
    title: "Kesar Peda",
    image: sweetsImg,
    price: 299,
    originalPrice: 359,
    rating: 5,
    description: "Saffron-infused divine sweets",
    category: "sweets"
  },
  {
    id: "7",
    title: "Mishri Dana",
    image: sweetsImg,
    price: 99,
    originalPrice: 129,
    rating: 4,
    description: "Pure rock candy for offerings",
    category: "sweets"
  },
  {
    id: "8",
    title: "Coconut Laddu",
    image: sweetsImg,
    price: 179,
    originalPrice: 229,
    rating: 5,
    description: "Fresh coconut blessed sweets",
    category: "sweets"
  },
  {
    id: "9",
    title: "Ramayana - Complete Edition",
    image: booksImg,
    price: 499,
    originalPrice: 699,
    rating: 5,
    description: "Complete epic with beautiful illustrations",
    category: "books"
  },
  {
    id: "10",
    title: "Bhagavad Gita",
    image: booksImg,
    price: 299,
    originalPrice: 399,
    rating: 5,
    description: "Sacred text with commentary",
    category: "books"
  },
  {
    id: "11",
    title: "Hanuman Chalisa",
    image: booksImg,
    price: 99,
    originalPrice: 149,
    rating: 5,
    description: "Devotional hymns and prayers",
    category: "books"
  },
  {
    id: "12",
    title: "Mahabharata Set",
    image: booksImg,
    price: 1299,
    originalPrice: 1799,
    rating: 5,
    description: "Complete epic in beautiful binding",
    category: "books"
  },
  {
    id: "13",
    title: "Aries Rashi Yantra",
    image: rashiImg,
    price: 399,
    originalPrice: 599,
    rating: 5,
    description: "Sacred geometry for Aries zodiac",
    category: "rashi"
  },
  {
    id: "14",
    title: "Leo Rashi Pendant",
    image: rashiImg,
    price: 599,
    originalPrice: 799,
    rating: 5,
    description: "Golden pendant for Leo natives",
    category: "rashi"
  },
  {
    id: "15",
    title: "Complete Rashi Chart",
    image: rashiImg,
    price: 999,
    originalPrice: 1299,
    rating: 5,
    description: "All 12 zodiac symbols in sacred design",
    category: "rashi"
  },
  {
    id: "16",
    title: "Personalized Rashi Stone",
    image: rashiImg,
    price: 799,
    originalPrice: 999,
    rating: 4,
    description: "Gemstone based on your birth chart",
    category: "rashi"
  }
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}


