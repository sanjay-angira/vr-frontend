import {
  Award,
  Headphones,
  Leaf,
  MapPin,
  PackageOpen,
  ShieldCheck,
  Star,
  Truck,
  Users,
} from "lucide-react";
import {
  SectionHeading,
  type SectionHeadingProps,
} from "@/components/website/shared/SectionHeading";

const features = [
  {
    id: "fast-delivery",
    icon: Truck,
    title: "Fast Delivery",
    description:
      "Reliable shipping across India with timely order fulfillment.",
  },
  {
    id: "authentic",
    icon: Leaf,
    title: "100% Authentic Products",
    description:
      "Carefully sourced groceries, spices, and spiritual essentials.",
  },
  {
    id: "secure",
    icon: ShieldCheck,
    title: "Secure Payments",
    description:
      "Safe and encrypted checkout with trusted payment options.",
  },
  {
    id: "returns",
    icon: PackageOpen,
    title: "Easy Returns",
    description:
      "Hassle-free returns for eligible products and quick support.",
  },
  {
    id: "trusted",
    icon: Users,
    title: "Trusted by Thousands",
    description:
      "Loved by families for quality, freshness, and excellent service.",
  },
  {
    id: "support",
    icon: Headphones,
    title: "Dedicated Support",
    description: "Friendly assistance before and after every purchase.",
  },
] as const;

const trustItems = [
  {
    id: "quality",
    icon: Award,
    label: "100% Authentic Quality Products",
  },
  {
    id: "premium",
    icon: Leaf,
    label: "Premium Quality You Can Trust",
  },
  {
    id: "safe",
    icon: ShieldCheck,
    label: "Safe & Secure Shopping",
  },
  {
    id: "delivery",
    icon: MapPin,
    label: "Pan India Delivery",
  },
  {
    id: "customers",
    icon: Star,
    label: "10,000+ Happy Customers",
  },
] as const;

const DEFAULT_HEADING: SectionHeadingProps = {
  eyebrow: "WHY SHOP WITH US",
  title: "Why Thousands of Families Choose Vrindavan Rasa",
  accent: "Vrindavan Rasa",
  description:
    "Experience premium grocery shopping with carefully selected spices, dry fruits, puja essentials, wellness products, and everyday household items. We combine authentic quality, secure shopping, and dependable delivery to bring the goodness of tradition right to your doorstep.",
};

function BotanicalDecor() {
  return (
    <>
      <svg
        className="why-choose-decor why-choose-decor--leaves"
        viewBox="0 0 220 180"
        aria-hidden
      >
        <g fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.55">
          <path d="M28 150c42-18 68-52 74-98" />
          <path d="M102 52c-18 28-8 58 18 78" />
          <path d="M78 86c22-8 42 4 52 28" />
          <path d="M40 128c20-6 34 2 44 18" />
          <ellipse
            cx="118"
            cy="44"
            rx="18"
            ry="10"
            transform="rotate(-28 118 44)"
          />
          <ellipse
            cx="92"
            cy="70"
            rx="16"
            ry="9"
            transform="rotate(-10 92 70)"
          />
          <ellipse
            cx="132"
            cy="98"
            rx="20"
            ry="10"
            transform="rotate(18 132 98)"
          />
          <ellipse
            cx="70"
            cy="112"
            rx="14"
            ry="8"
            transform="rotate(-35 70 112)"
          />
          <ellipse
            cx="48"
            cy="138"
            rx="12"
            ry="7"
            transform="rotate(-20 48 138)"
          />
        </g>
      </svg>

      <svg
        className="why-choose-decor why-choose-decor--feather"
        viewBox="0 0 120 320"
        aria-hidden
      >
        <g fill="none" stroke="currentColor" strokeWidth="1.35" opacity="0.5">
          <path d="M60 12c8 48 10 110 4 168-4 40-14 78-28 118" />
          <path d="M60 40c28 18 44 48 46 86" />
          <path d="M60 70c-26 16-40 44-42 78" />
          <path d="M62 110c24 14 36 40 34 72" />
          <path d="M58 140c-20 12-30 34-30 60" />
          <path d="M60 175c18 12 26 32 24 56" />
          <ellipse
            cx="78"
            cy="52"
            rx="22"
            ry="12"
            transform="rotate(55 78 52)"
            fill="currentColor"
            opacity="0.12"
          />
          <ellipse
            cx="78"
            cy="52"
            rx="10"
            ry="5"
            transform="rotate(55 78 52)"
            fill="currentColor"
            opacity="0.22"
          />
        </g>
      </svg>
    </>
  );
}

export function WhyChooseSection({ heading }: { heading: SectionHeadingProps }) {
  return (
    <section
      className="why-choose-section"
      aria-label="Why Choose Vrindavan Rasa"
    >
      <BotanicalDecor />

      <div className="container why-choose-inner">
        <SectionHeading {...heading} />

        <div className="why-choose-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.id}
                className="why-choose-card"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="why-choose-icon-wrap">
                  <Icon size={28} strokeWidth={1.6} className="why-choose-icon" />
                </div>
                <h3 className="why-choose-card-title">{feature.title}</h3>
                <p className="why-choose-card-description">{feature.description}</p>
              </article>
            );
          })}
        </div>

        <ul className="why-choose-trust-bar" aria-label="Trust highlights">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="why-choose-trust-item">
                <span className="why-choose-trust-icon" aria-hidden>
                  <Icon size={18} strokeWidth={1.7} />
                </span>
                <span className="why-choose-trust-label">{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
