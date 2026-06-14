import heroImage from "@/assets/spiritual-hero.jpg";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="hero">
      {/* Background Image */}
      <Image 
        src={heroImage} 
        alt="Sacred spiritual products" 
        className="hero-bg"
      />
      <div className="hero-overlay" />
      
      {/* Content */}
      <div className="hero-content">
        <div className="hero-icon">🕉</div>
        <h1 className="hero-title">Sacred Store</h1>
        <p className="hero-subtitle">
          Discover authentic spiritual products, sacred books, divine sweets, and blessed items for your spiritual journey
        </p>
        
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg">
            Explore Products
          </button>
          <button className="btn btn-outline btn-lg">
            Learn More
          </button>
        </div>
        
        {/* Features */}
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
};

export default HeroSection;