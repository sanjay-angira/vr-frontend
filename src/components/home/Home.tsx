import HeroSection from "@/components/HeroSection";
import rudraksha from "@/assets/rudraksha-collection.jpg";
import sweets from "@/assets/spiritual-sweets.jpg";
import books from "@/assets/spiritual-books.jpg";
import rashi from "@/assets/rashi-logos.jpg";
import ProductSection from "@/components/sections/ProductSection";
import BlogSection from "@/components/sections/BlogSection";
import CategorySection from "@/components/sections/CategorySection";
import ProductComboSection from "../sections/ProductComboSection";
import WhyChooseSection from "../sections/WhyChooseSection";
import WhyOnlyThisMasalaSection from "../sections/WhyOnlyThisMasalaSection";
import ProductReviewsShowcase from "../sections/ProductReviewsShowcase";


const Home = () => {

  const rudrakshProducts = [
    {
      id: "1",
      name: "Amethyst Crystal Cluster",
      description: "Natural amethyst cluster perfect for meditation and spiritual cleansing. Promotes tranquility and inner peace.",
      price: 89.99,
      originalPrice: 129.99,
      image: rudraksha.src,
      category: "Crystals",
      rating: 4.8,
      reviewCount: 156,
      inStock: true,
      isNew: true,
      isFeatured: true,
      tags: ["healing", "meditation", "energy"],
      benefits: ["Promotes mental clarity", "Enhances spiritual awareness", "Reduces stress and anxiety"]
    },
    {
      id: "2",
      name: "Sage Smudge Bundle Set",
      description: "Ethically sourced white sage bundles for cleansing negative energy and purifying sacred spaces.",
      price: 24.99,
      originalPrice: 34.99,
      image: rudraksha.src,
      category: "Sage & Incense",
      rating: 4.9,
      reviewCount: 203,
      inStock: true,
      isFeatured: false,
      tags: ["cleansing", "purification", "ritual"],
      benefits: ["Clears negative energy", "Purifies living spaces", "Enhances meditation practice"]
    },
    {
      id: "3",
      name: "Tibetan Singing Bowl",
      description: "Handcrafted brass singing bowl with wooden striker. Creates beautiful resonant tones for meditation.",
      price: 67.50,
      image: rudraksha.src,
      category: "Sound Healing",
      rating: 4.7,
      reviewCount: 89,
      inStock: true,
      isNew: false,
      tags: ["meditation", "sound", "healing"],
      benefits: ["Promotes deep relaxation", "Balances chakras", "Enhances focus"]
    },
    {
      id: "4",
      name: "Rose Quartz Heart Stone",
      description: "Beautiful rose quartz heart-shaped stone, known as the stone of unconditional love and healing.",
      price: 19.99,
      originalPrice: 29.99,
      image: rudraksha.src,
      category: "Crystals",
      rating: 4.6,
      reviewCount: 142,
      inStock: false,
      isFeatured: false,
      tags: ["love", "healing", "heart"],
      benefits: ["Attracts love and compassion", "Heals emotional wounds", "Opens the heart chakra"]
    },
  ];

  const bookProducts = [
    {
      id: "1",
      name: "Amethyst Crystal Cluster",
      description: "Natural amethyst cluster perfect for meditation and spiritual cleansing. Promotes tranquility and inner peace.",
      price: 89.99,
      originalPrice: 129.99,
      image: books.src,
      category: "Crystals",
      rating: 4.8,
      reviewCount: 156,
      inStock: true,
      isNew: true,
      isFeatured: true,
      tags: ["healing", "meditation", "energy"],
      benefits: ["Promotes mental clarity", "Enhances spiritual awareness", "Reduces stress and anxiety"]
    },
    {
      id: "2",
      name: "Sage Smudge Bundle Set",
      description: "Ethically sourced white sage bundles for cleansing negative energy and purifying sacred spaces.",
      price: 24.99,
      originalPrice: 34.99,
      image: books.src,
      category: "Sage & Incense",
      rating: 4.9,
      reviewCount: 203,
      inStock: true,
      isFeatured: false,
      tags: ["cleansing", "purification", "ritual"],
      benefits: ["Clears negative energy", "Purifies living spaces", "Enhances meditation practice"]
    },
    {
      id: "3",
      name: "Tibetan Singing Bowl",
      description: "Handcrafted brass singing bowl with wooden striker. Creates beautiful resonant tones for meditation.",
      price: 67.50,
      image: books.src,
      category: "Sound Healing",
      rating: 4.7,
      reviewCount: 89,
      inStock: true,
      isNew: false,
      tags: ["meditation", "sound", "healing"],
      benefits: ["Promotes deep relaxation", "Balances chakras", "Enhances focus"]
    },
    {
      id: "4",
      name: "Rose Quartz Heart Stone",
      description: "Beautiful rose quartz heart-shaped stone, known as the stone of unconditional love and healing.",
      price: 19.99,
      originalPrice: 29.99,
      image: books.src,
      category: "Crystals",
      rating: 4.6,
      reviewCount: 142,
      inStock: false,
      isFeatured: false,
      tags: ["love", "healing", "heart"],
      benefits: ["Attracts love and compassion", "Heals emotional wounds", "Opens the heart chakra"]
    },
  ];


  const productCategory = [
    {
      id: 1,
      name: 'Rudraksha Collection',
      description: 'Authentic blessed beads from the holy lands for spiritual growth and divine protection',
      image: rudraksha.src,
      productCount: 12,
      href: '/rudraksha',
    },
    {
      id: 2,
      name: 'Divine Sweets & Prasadam',
      description: 'Traditional blessed sweets prepared with devotion and served as sacred offerings',
      image: sweets.src,
      productCount: 18,
      href: '/sweets',
    },
    {
      id: 3,
      name: 'Sacred Books & Literature',
      description: 'Holy texts, spiritual guides, and devotional literature for your spiritual journey',
      image: books.src,
      productCount: 8,
      href: '/books',
    },
    {
      id: 4,
      name: 'Rashi & Zodiac Items',
      description: 'Personalized spiritual items based on your zodiac sign and birth chart',
      image: rashi.src,
      productCount: 15,
      href: '/rashi',
    },
    {
      id: 5,
      name: 'Puja Essentials',
      description: 'Incense, diyas, thalis, and sacred items for daily worship and rituals',
      image: rudraksha.src,
      productCount: 6,
      href: '/store',
    },
    {
      id: 6,
      name: 'Gift Hampers',
      description: 'Curated spiritual gift sets for festivals, blessings, and special occasions',
      image: sweets.src,
      productCount: 4,
      href: '/store',
    },
  ];

  const blogPosts = [
    {
      id: 1,
      category: "Culture",
      date: "Mar 10, 2026",
      title: "The Ultimate Guide to Indian Spice Markets",
      excerpt:
        "Explore the vibrant world of spice bazaars and learn how to pick the freshest spices for your kitchen.",
      image: rudraksha.src,
      href: "/blog/ultimate-guide-indian-spice-markets",
    },
    {
      id: 2,
      category: "Cooking Tips",
      date: "Mar 5, 2026",
      title: "5 Spices That Transform Any Home Cooking",
      excerpt:
        "Discover the five essential spices every home cook needs and how to use them for maximum flavor.",
      image: sweets.src,
      href: "/blog/5-spices-transform-home-cooking",
    },
    {
      id: 3,
      category: "Health",
      date: "Feb 28, 2026",
      title: "Health Benefits of Turmeric & Ginger",
      excerpt:
        "From reducing inflammation to boosting immunity, these golden spices are nature's best medicine.",
      image: books.src,
      href: "/blog/health-benefits-turmeric-ginger",
    },
  ];



  const reviews = [
    {
      id: 1,
      quote:
        '"The saffron is absolutely incredible! Best quality I\'ve found online. The aroma alone is worth every penny."',
      product: "Premium Saffron Threads",
      name: "Sarah M.",
      location: "New York, USA",
      rating: 5,
    },
    {
      id: 2,
      quote:
        '"As someone who grew up with fresh spices, SpiceHaven is the closest I\'ve come to the real deal. Authentic and flavorful."',
      product: "Kashmiri Red Chili",
      name: "Raj P.",
      location: "London, UK",
      rating: 5,
    },
    {
      id: 3,
      quote:
        '"Fast shipping, beautiful packaging, and the turmeric has such a vibrant color. I\'m a customer for life!"',
      product: "Organic Turmeric Powder",
      name: "Maria L.",
      location: "Toronto, Canada",
      rating: 5,
    },
    {
      id: 4,
      quote:
        '"Great selection and fair prices. The cumin seeds are incredibly aromatic. Will definitely order again."',
      product: "Whole Cumin Seeds",
      name: "James K.",
      location: "Sydney, Australia",
      rating: 4,
    },
  ];


  return (
    <div style={{ minHeight: '100vh' }}>
      <HeroSection />

      <CategorySection
        title="Browse by Category"
        subtitle="Our Collection"
        categories={productCategory}
      />

      <ProductSection
        title="Popular Products"
        subtitle="Customer Favorites"
        products={rudrakshProducts}
        viewAllLink="/rudraksha"
      />

      <WhyChooseSection />

      <ProductComboSection
        title="Exclusive Product Combos"
        subtitle="Best Buy"
        comboProducts={bookProducts}
        viewAllLink="/combos"

      />

      <WhyOnlyThisMasalaSection />
      <ProductReviewsShowcase
        title="What Customers Say"
        subtitle="Product Reviews"
        reviews={reviews}

      />

      <BlogSection
        posts={blogPosts}
        title="Our Blog"
        subtitle="From The Kitchen"
      />
    </div>
  );
};

export default Home;
