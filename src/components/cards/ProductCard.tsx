'use client'
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '@/services/redux/slices/cartSlice';
import { toggleModal } from '@/services/redux/slices/modalSlice';
import { RootState } from '@/services/redux/store';
import { postData } from '@/services/api/apiService';
import { API_ENDPOINTS } from '@/services/api/API_ENDPOINT';
import Link from "next/link";
import { useMemo, useState } from "react";

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
    slug?: string;
}

export interface ProductCardProps {
    product?: Product;
    id?: string;
    title?: string;
    image?: string | { src?: string };
    price?: string | number;
    originalPrice?: string | number;
    rating?: number;
    description?: string;
    category?: string;
    reviewCount?: number;
    inStock?: boolean;
    className?: string;
    href?: string;
    onAddToCart?: (product: Product) => void;
    onQuickView?: (product: Product) => void;
    onWishlist?: (product: Product) => void;
}

export const ProductCard = ({
    product,
    id,
    title,
    image,
    price,
    originalPrice,
    rating,
    description,
    category,
    reviewCount,
    inStock,
    className,
    href,
    onAddToCart,
    onQuickView,
    onWishlist,
}: ProductCardProps) => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const normalizedProduct: Product = product ?? {
        id: id ?? "",
        name: title ?? "",
        description: description ?? "",
        price: typeof price === "number" ? price : Number(price ?? 0),
        originalPrice:
            typeof originalPrice === "number"
                ? originalPrice
                : originalPrice !== undefined
                    ? Number(originalPrice)
                    : undefined,
        image: typeof image === "string" ? image : image?.src ?? "",
        category: category ?? "",
        rating: rating ?? 0,
        reviewCount: reviewCount ?? 0,
        inStock: inStock ?? true,
        slug: undefined,
    };

    const currentPrice = Number(normalizedProduct.price || 0);
    const listPrice = Number(normalizedProduct.originalPrice || 0);
    const hasDiscount = listPrice > currentPrice && currentPrice > 0;
    const discountPercentage = hasDiscount
        ? Math.round(((listPrice - currentPrice) / listPrice) * 100)
        : 0;

    const priceFormatter = useMemo(
        () =>
            new Intl.NumberFormat("en-IN", {
                maximumFractionDigits: 0,
            }),
        [],
    );

    const handleAddToCart = async (item: Product) => {
        try {
            const variationId = Number(item.id);
            if (!Number.isFinite(variationId) || variationId <= 0) {
                return;
            }

            setIsAddingToCart(true);
            await postData(API_ENDPOINTS.ADD_CART_ITEM, {
                variationId,
                quantity: 1,
            });
            dispatch(addItem({ id: String(variationId), quantity: 1 }));
            onAddToCart?.(item);
        } catch (error) {
            console.error('Failed to add item to cart', error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleWishlist = (item: Product) => {
        if (!user.id) {
            dispatch(toggleModal());
            return;
        }
        onWishlist?.(item);
    };

    const handleQuickView = (item: Product) => {
        onQuickView?.(item);
    };

    const imageElement = (
        <img
            src={normalizedProduct.image}
            alt={normalizedProduct.name}
            className="product-image"
            loading="lazy"
            onError={(event) => {
                event.currentTarget.src = "/next.svg";
            }}
        />
    );

    return (
        <div className={`product-card-1 ${className || ''}`}>
            <div className="image-container">
                {href ? (
                    <Link href={href} aria-label={normalizedProduct.name}>
                        {imageElement}
                    </Link>
                ) : (
                    imageElement
                )}

                <div className="badges">
                    {normalizedProduct.isNew && (
                        <span className="badge new">New</span>
                    )}
                    {hasDiscount && (
                        <span className="badge sale">
                            -{discountPercentage}%
                        </span>
                    )}
                </div>

                <div className="quick-actions">
                    <button
                        className="action-btn"
                        onClick={() => handleWishlist(normalizedProduct)}
                        aria-label="Add to wishlist"
                    >
                        <Heart />
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => handleQuickView(normalizedProduct)}
                        aria-label="Quick view"
                    >
                        <Eye />
                    </button>
                </div>

                <div className="add-to-cart-container">
                    <button
                        className="add-to-cart-btn"
                        onClick={() => {
                            handleAddToCart(normalizedProduct);
                        }}
                        disabled={!normalizedProduct.inStock || isAddingToCart}
                    >
                        <ShoppingCart />
                        {isAddingToCart ? "Adding..." : "Add to Cart"}
                    </button>
                </div>
            </div>

            <div className="content">
                <div className="category">{normalizedProduct.category}</div>

                <h3 className="product-name">
                    {href ? (
                        <Link href={href}>{normalizedProduct.name}</Link>
                    ) : (
                        normalizedProduct.name
                    )}
                </h3>

                <div className="rating">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`star ${i < Math.floor(normalizedProduct.rating) ? 'filled' : 'empty'}`}
                        />
                    ))}
                    <span className="review-count">({normalizedProduct.reviewCount})</span>
                </div>

                <div className="price-section">
                    <div className="prices">
                        <span className="current-price">Rs. {priceFormatter.format(currentPrice)}</span>
                        {hasDiscount && (
                            <span className="original-price">Rs. {priceFormatter.format(listPrice)}</span>
                        )}
                    </div>
                    <div className={`stock-status ${normalizedProduct.inStock ? 'in-stock' : 'out-of-stock'}`}>
                        {normalizedProduct.inStock ? "In Stock" : "Out of Stock"}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
