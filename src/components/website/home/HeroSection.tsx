import Image from "next/image";
import Link from "next/link";
import { WEBSITE_IMAGES } from "@/components/website/data/products";

export function HeroSection() {
  return (
    <section className="hero">
      <Image
        src={WEBSITE_IMAGES.hero}
        alt="Sacred spiritual products"
        className="hero-bg"
        fill
        priority
        sizes="100vw"
      />
      <div className="hero-overlay" />

      <div className="hero-content">
        <div className="hero-icon">🕉</div>
        <h1 className="hero-title">Vrindavan Rasa</h1>
        <p className="hero-subtitle">
          Discover authentic spiritual products, sacred books, divine sweets, and
          blessed items for your spiritual journey
        </p>

        <div className="hero-actions">
          <Link href="/shop" className="btn btn-primary btn-lg">
            Explore Products
          </Link>
          <Link href="/about-us" className="btn btn-outline btn-lg">
            Learn More
          </Link>
        </div>

        <div className="hero-features">
          <div className="hero-feature">
            <div className="hero-feature-icon">📿</div>
            <h3>Authentic Rudraksha</h3>
            <p>Genuine sacred beads for spiritual well-being</p>
          </div>
          <div className="hero-feature">
            <div className="hero-feature-icon">📚</div>
            <h3>Sacred Texts</h3>
            <p>Holy books and spiritual literature</p>
          </div>
          <div className="hero-feature">
            <div className="hero-feature-icon">🍯</div>
            <h3>Divine Sweets</h3>
            <p>Traditional blessed sweets and prasadam</p>
          </div>
        </div>
      </div>
    </section>
  );
}
