import { Leaf, Package, Smile } from "lucide-react";

const features = [
  {
    id: 1,
    icon: Leaf,
    title: "Authentic & Pure",
    description:
      "We source genuine spiritual products with care, ensuring authenticity for every customer.",
  },
  {
    id: 2,
    icon: Smile,
    title: "Blessed With Devotion",
    description:
      "Each item is selected and handled with reverence for your spiritual practice.",
  },
  {
    id: 3,
    icon: Package,
    title: "Secure Delivery",
    description:
      "Carefully packed and shipped so your sacred items arrive safely at your doorstep.",
  },
];

export function WhyChooseSection() {
  return (
    <section className="why-choose-section">
      <div className="container">
        <h2 className="why-choose-title">
          Vrindavan Rasa: Your Trusted Spiritual Store
        </h2>
        <div className="why-choose-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.id} className="why-choose-card">
                <div className="why-choose-icon-wrap">
                  <Icon size={38} className="why-choose-icon" />
                </div>
                <h3 className="why-choose-card-title">{feature.title}</h3>
                <p className="why-choose-card-description">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
