import { Leaf, Smile, Package } from "lucide-react";

const features = [
  {
    id: 1,
    icon: Leaf,
    title: "Pure for Sure",
    description:
      "For years, we've been dedicated to providing our customers with the finest, unadulterated spices, and we'll continue to uphold this promise.",
  },
  {
    id: 2,
    icon: Smile,
    title: "Flavourful",
    description:
      "Our cutting-edge technology ensures our blends retain their flavor, aroma, and color for an extended period, resulting in a longer shelf life and unparalleled freshness.",
  },
  {
    id: 3,
    icon: Package,
    title: "Hygienically Packed",
    description:
      "From cleaning to packaging, our fully automated process eliminates human contact, ensuring absolute purity and quality for our customers.",
  },
];

const WhyChooseSection = () => {
  return (
    <section className="why-choose-section">
      <div className="container">
        <h2 className="why-choose-title">Hathi Masala: Your Best Choice For Spices</h2>

        <div className="why-choose-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.id} className="why-choose-card">
                <div className="why-choose-icon-wrap">
                  <Icon size={38} className="why-choose-icon" />
                </div>

                <h3 className="why-choose-card-title">{feature.title}</h3>
                <p className="why-choose-card-description">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
