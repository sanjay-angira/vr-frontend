export interface Product {
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
}

export interface ProductCardProps {
    product: Product;
    className?: string;
    onAddToCart?: (product: Product) => void;
    onQuickView?: (product: Product) => void;
    onWishlist?: (product: Product) => void;
}

export const sampleProducts: Product[] = [
    {
        id: "1",
        name: "Amethyst Crystal Cluster",
        description: "Natural amethyst cluster perfect for meditation and spiritual cleansing. Promotes tranquility and inner peace.",
        price: 89.99,
        originalPrice: 129.99,
        image: "https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400&h=400&fit=crop",
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
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
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
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop",
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
        image: "https://images.unsplash.com/photo-1605164388643-46127dca4732?w=400&h=400&fit=crop",
        category: "Crystals",
        rating: 4.6,
        reviewCount: 142,
        inStock: false,
        isFeatured: false,
        tags: ["love", "healing", "heart"],
        benefits: ["Attracts love and compassion", "Heals emotional wounds", "Opens the heart chakra"]
    },
    {
        id: "5",
        name: "Palo Santo Wood Sticks",
        description: "Sacred Palo Santo wood from Ecuador. Known as 'Holy Wood' for its purifying and calming properties.",
        price: 15.99,
        image: "https://images.unsplash.com/photo-1594736797933-d0a4e6e2651a?w=400&h=400&fit=crop",
        category: "Sage & Incense",
        rating: 4.8,
        reviewCount: 178,
        inStock: true,
        isNew: true,
        tags: ["sacred", "cleansing", "aromatherapy"],
        benefits: ["Clears negative energy", "Promotes relaxation", "Natural insect repellent"]
    },
    {
        id: "6",
        name: "Crystal Chakra Set",
        description: "Complete set of seven chakra stones for balancing and aligning your energy centers.",
        price: 45.00,
        originalPrice: 65.00,
        image: "https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=400&h=400&fit=crop",
        category: "Crystals",
        rating: 4.9,
        reviewCount: 267,
        inStock: true,
        isFeatured: true,
        tags: ["chakra", "balance", "healing"],
        benefits: ["Balances all chakras", "Promotes energy flow", "Enhances spiritual growth"]
    },
    {
        id: "7",
        name: "Meditation Cushion",
        description: "Comfortable meditation cushion filled with organic buckwheat hulls. Supports proper posture during practice.",
        price: 39.99,
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
        category: "Meditation",
        rating: 4.5,
        reviewCount: 94,
        inStock: true,
        tags: ["meditation", "comfort", "posture"],
        benefits: ["Improves meditation posture", "Reduces discomfort", "Enhances focus"]
    },
    {
        id: "8",
        name: "Essential Oil Diffuser",
        description: "Ultrasonic aromatherapy diffuser with LED lights. Perfect for creating a peaceful atmosphere.",
        price: 52.99,
        originalPrice: 79.99,
        image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
        category: "Aromatherapy",
        rating: 4.7,
        reviewCount: 156,
        inStock: true,
        isNew: false,
        tags: ["aromatherapy", "diffuser", "relaxation"],
        benefits: ["Disperses essential oils", "Creates ambiance", "Promotes relaxation"]
    },
    {
        id: "9",
        name: "Tarot Card Deck",
        description: "Beautiful illustrated tarot deck with guidebook. Perfect for beginners and experienced readers alike.",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
        category: "Divination",
        rating: 4.8,
        reviewCount: 123,
        inStock: true,
        isFeatured: true,
        tags: ["tarot", "divination", "guidance"],
        benefits: ["Provides spiritual guidance", "Enhances intuition", "Supports self-reflection"]
    },
    {
        id: "10",
        name: "Lavender Scented Candles",
        description: "Set of three soy wax candles infused with pure lavender essential oil. Hand-poured with love.",
        price: 34.99,
        originalPrice: 49.99,
        image: "https://images.unsplash.com/photo-1602874801006-22b22984f999?w=400&h=400&fit=crop",
        category: "Candles",
        rating: 4.6,
        reviewCount: 87,
        inStock: true,
        tags: ["candles", "lavender", "relaxation"],
        benefits: ["Promotes better sleep", "Creates calming atmosphere", "Natural aromatherapy"]
    }
];