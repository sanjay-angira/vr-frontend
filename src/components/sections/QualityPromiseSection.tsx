import { PackageCheck, ShieldCheck, Soup, Sprout, Users } from "lucide-react";
import {
  SectionHeading,
  type SectionHeadingProps,
} from "@/components/shared/SectionHeading";

const qualityPromiseItems = [
  {
    id: "sourcing",
    icon: Sprout,
    title: "Thoughtful Sourcing",
    description: "Handpicked from trusted farms.",
  },
  {
    id: "quality",
    icon: ShieldCheck,
    title: "Strict Quality Checks",
    description: "Multi-stage testing for purity & safety.",
  },
  {
    id: "processing",
    icon: Soup,
    title: "Careful Processing",
    description: "Preserving natural nutrition.",
  },
  {
    id: "packaging",
    icon: PackageCheck,
    title: "Hygienic Packaging",
    description: "Sealed fresh for longer goodness.",
  },
  {
    id: "families",
    icon: Users,
    title: "Trusted by Families",
    description: "Chosen by thousands of happy customers.",
  },
] as const;

const qualityPromiseHeading: SectionHeadingProps = {
  eyebrow: "OUR QUALITY PROMISE",
  title: "From Farm to Your Kitchen",
  accent: "Kitchen",
  description:
    "Discover how we select, source and carefully pack everyday essentials while maintaining our quality standards.",
};

export function QualityPromiseSection() {
  return (
    <section
      className="section home-section quality-promise-section"
      aria-label="Our quality promise"
    >
      <div className="container">
        <SectionHeading {...qualityPromiseHeading} />

        <ul className="quality-promise-grid">
          {qualityPromiseItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="quality-promise-item">
                <span className="quality-promise-icon" aria-hidden="true">
                  <Icon size={34} strokeWidth={1.6} />
                </span>
                <h3 className="quality-promise-title">{item.title}</h3>
                <p className="quality-promise-description">
                  {item.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
