import Link from "next/link";
import { Clock3, Headphones, MessageCircle, Phone } from "lucide-react";
import {
  Accordion,
  type AccordionItem,
} from "@/components/website/shared/Accordion";
import { STATIC_FOOTER_SETTINGS } from "@/types/footer";

type ProductFaqSectionProps = {
  items: AccordionItem[];
  phone?: string;
};

export function ProductFaqSection({ items, phone }: ProductFaqSectionProps) {
  const displayPhone = phone?.trim() || STATIC_FOOTER_SETTINGS.phone || "";
  const telHref = displayPhone
    ? `tel:${displayPhone.replace(/[^\d+]/g, "")}`
    : undefined;

  return (
    <section
      className="product-section-block product-faq-block"
      aria-labelledby="product-faq-title"
    >
      <header className="product-faq-intro">
        <h2 id="product-faq-title" className="product-faq-heading">
          Frequently Asked Questions
        </h2>
        <p className="product-faq-subcopy">
          Find answers to the most common questions about our products.
        </p>
      </header>

      <Accordion
        items={items}
        className="product-faq-accordion"
        showIndex
        defaultOpenFirst
        showChevron={false}
      />

      <div className="product-faq-support">
        <div className="product-faq-support-item">
          <Headphones size={20} strokeWidth={1.8} aria-hidden />
          <div>
            <strong>Still have questions?</strong>
            <p>We&apos;re here to help you with anything you need.</p>
          </div>
        </div>
        <div className="product-faq-support-item">
          <Clock3 size={20} strokeWidth={1.8} aria-hidden />
          <div>
            <strong>Quick Response</strong>
            <p>We typically reply within a few minutes.</p>
          </div>
        </div>
        <div className="product-faq-support-item">
          <Phone size={20} strokeWidth={1.8} aria-hidden />
          <div>
            <strong>Call Us</strong>
            {telHref ? (
              <a href={telHref}>{displayPhone}</a>
            ) : (
              <p>Reach us on the contact page.</p>
            )}
            <p>Mon-Sat, 10AM – 7PM</p>
          </div>
        </div>
        <Link href="/contact-us" className="product-faq-contact-btn">
          <MessageCircle size={16} strokeWidth={2.2} aria-hidden />
          Contact Us
        </Link>
      </div>
    </section>
  );
}
