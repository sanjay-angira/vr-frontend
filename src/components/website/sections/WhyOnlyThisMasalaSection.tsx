import {
  Building2,
  Handshake,
  Leaf,
  Scale,
  Search,
  ShieldCheck,
} from "lucide-react";
import { WEBSITE_IMAGES } from "@/components/website/data/products";

const leftPoints = [
  {
    id: 1,
    icon: ShieldCheck,
    text: "Authentic spiritual products sourced with devotion and care for every devotee.",
  },
  {
    id: 2,
    icon: Scale,
    text: "Every item is selected to reflect purity, tradition, and lasting spiritual value.",
  },
  {
    id: 3,
    icon: Handshake,
    text: "We listen to our customers and continuously improve our sacred collections.",
  },
];

const rightPoints = [
  {
    id: 1,
    icon: Search,
    text: "Clear focus on quality, transparency, and meaningful spiritual experiences.",
  },
  {
    id: 2,
    icon: Building2,
    text: "Trusted sourcing and careful handling from selection to delivery.",
  },
  {
    id: 3,
    icon: ShieldCheck,
    text: "Strength, stability, and reverence in every product we offer.",
  },
];

export function WhyOnlyThisMasalaSection() {
  return (
    <section className="section why-hathi-section">
      <div className="container">
        <div className="why-hathi-header">
          <h2 className="why-hathi-title">Why Vrindavan Rasa?</h2>
          <div className="why-hathi-divider" aria-hidden>
            <span />
            <Leaf size={18} />
            <span />
          </div>
          <p className="why-hathi-subtitle">
            A brand built on devotion, authenticity, and service to the spiritual
            community.
          </p>
        </div>
        <div className="why-hathi-layout">
          <div className="why-hathi-col left">
            {leftPoints.map((point) => {
              const Icon = point.icon;
              return (
                <article key={point.id} className="why-hathi-point">
                  <div className="why-hathi-point-icon">
                    <Icon size={24} />
                  </div>
                  <p>{point.text}</p>
                </article>
              );
            })}
          </div>
          <div className="why-hathi-center">
            <img
              src={WEBSITE_IMAGES.rashi}
              alt="Vrindavan Rasa emblem"
              className="why-hathi-image"
            />
          </div>
          <div className="why-hathi-col right">
            {rightPoints.map((point) => {
              const Icon = point.icon;
              return (
                <article key={point.id} className="why-hathi-point">
                  <p>{point.text}</p>
                  <div className="why-hathi-point-icon">
                    <Icon size={24} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
