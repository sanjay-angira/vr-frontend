import { Leaf, ShieldCheck, Handshake, Search, Building2, Scale } from "lucide-react";
import rashi from "@/assets/rashi-logos.jpg";

const leftPoints = [
  {
    id: 1,
    icon: ShieldCheck,
    text: "Defining Gandhi Spices with an elephant logo portrays its business philosophy and working ethos.",
  },
  {
    id: 2,
    icon: Scale,
    text: "Gigantic size and pillar-like feet show giant vision and steady growth, while white tusks symbolize purity.",
  },
  {
    id: 3,
    icon: Handshake,
    text: "The big ears reflect openness to customer feedback and awareness of market trends and technology.",
  },
];

const rightPoints = [
  {
    id: 1,
    icon: Search,
    text: "Small but sharp eyes represent the ability to see clearly and focus for the long term.",
  },
  {
    id: 2,
    icon: Building2,
    text: "The top seat and white bell symbolize strong factory infrastructure and experienced management.",
  },
  {
    id: 3,
    icon: ShieldCheck,
    text: "The overall logo reflects strength, stability, and patience towards products and business.",
  },
];

const WhyOnlyThisMasalaSection = () => {
  return (
    <section className="section why-hathi-section">
      <div className="container">
        <div className="why-hathi-header">
          <h2 className="why-hathi-title">Why Only This Masala ?</h2>

          <div className="why-hathi-divider" aria-hidden>
            <span />
            <Leaf size={18} />
            <span />
          </div>

          <p className="why-hathi-subtitle">
            It was company&apos;s founder who wanted a brand name that reflects the company and company&apos;
            principles.
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
            <img src={rashi.src} alt="Hathi Masala emblem" className="why-hathi-image" />
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
};

export default WhyOnlyThisMasalaSection;
