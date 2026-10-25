import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  House,
  Leaf,
  ShieldCheck,
  Truck,
} from "lucide-react";

const assurances = [
  { icon: Leaf, title: "Authentic finds", detail: "Rooted in tradition" },
  { icon: ShieldCheck, title: "Secure checkout", detail: "Shop with confidence" },
  { icon: Truck, title: "Reliable delivery", detail: "Across India" },
  { icon: Headphones, title: "Here to help", detail: "We are one message away" },
];

export default function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-hero" aria-labelledby="not-found-title">
        <div className="not-found-sun" aria-hidden="true" />

        <div className="not-found-content">
          <p className="not-found-eyebrow">A little detour</p>
          <Image
            src="/images/404-error.png"
            alt="404 with a peacock feather and an overflowing decorated clay pot"
            width={1625}
            height={968}
            priority
            sizes="(max-width: 760px) 92vw, 780px"
            className="not-found-art"
          />
          <h1 id="not-found-title">
            Page <span>not</span> found
          </h1>
          <p className="not-found-message">
            This page seems to have wandered off the path.
            <br className="not-found-desktop-break" /> Let’s help you find your
            way back.
          </p>
          <div className="not-found-actions">
            <Link href="/" className="not-found-home-link">
              <House size={18} aria-hidden="true" />
              Back to home
            </Link>
            <Link href="/contact-us" className="not-found-support-link">
              <Headphones size={18} aria-hidden="true" />
              Contact support
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <ul className="not-found-assurances" aria-label="Why shop with us">
        {assurances.map(({ icon: Icon, title, detail }) => (
          <li key={title} className="not-found-assurance">
            <span className="not-found-assurance-icon" aria-hidden="true">
              <Icon size={23} strokeWidth={1.6} />
            </span>
            <span className="not-found-assurance-copy">
              <strong>{title}</strong>
              <span>{detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
