"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { useFooterData } from "@/components/website/hooks/useFooterData";
import type {
  FooterLinkItem,
  FooterSection,
} from "@/utils/types/footer";

function FooterLink({ item }: { item: FooterLinkItem }) {
  const href = item.url?.trim() || "#";
  const isExternal = href.startsWith("http");

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="footer-link"
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link href={href} className="footer-link">
      {item.label}
    </Link>
  );
}

function MenuSection({ section }: { section: FooterSection }) {
  if (!section.items.length) return null;

  return (
    <div className="footer-section">
      <h3 className="footer-section-title">{section.title}</h3>
      <ul className="footer-link-list">
        {section.items.map((item) => (
          <li key={item.id}>
            <FooterLink item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactSection({
  section,
  email,
  phone,
  address,
}: {
  section: FooterSection;
  email?: string;
  phone?: string;
  address?: string;
}) {
  const hasSettings = Boolean(email || phone || address);
  const hasItems = section.items.length > 0;

  if (!hasSettings && !hasItems) return null;

  return (
    <div className="footer-section">
      <h3 className="footer-section-title">{section.title}</h3>
      <ul className="footer-contact-list">
        {phone && (
          <li>
            <Phone size={16} />
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="footer-link">
              {phone}
            </a>
          </li>
        )}
        {email && (
          <li>
            <Mail size={16} />
            <a href={`mailto:${email}`} className="footer-link">
              {email}
            </a>
          </li>
        )}
        {address && (
          <li>
            <MapPin size={16} />
            <span>{address}</span>
          </li>
        )}
        {section.items.map((item) => (
          <li key={item.id}>
            <FooterLink item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WebsiteFooter() {
  const { footerData, loading } = useFooterData();
  const { settings, sections } = footerData;

  const menuSections = sections.filter((section) => section.type === "menu");
  const contactSections = sections.filter(
    (section) => section.type === "contact"
  );

  const copyright =
    settings?.copyrightText ||
    `© ${new Date().getFullYear()} Vrindavan Rasa. All rights reserved.`;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">🕉</div>
              <span className="footer-logo-text">Vrindavan Rasa</span>
            </div>
            <p className="footer-brand-text">
              Your trusted source for authentic spiritual products, blessed items,
              and sacred literature.
            </p>
          </div>

          {loading ? (
            <div className="footer-section footer-loading">
              <div className="footer-skeleton-line" />
              <div className="footer-skeleton-line short" />
              <div className="footer-skeleton-line" />
            </div>
          ) : (
            <>
              {menuSections.map((section) => (
                <MenuSection key={section.id} section={section} />
              ))}
              {contactSections.map((section) => (
                <ContactSection
                  key={section.id}
                  section={section}
                  email={settings?.email}
                  phone={settings?.phone}
                  address={settings?.address}
                />
              ))}
            </>
          )}
        </div>

        <div className="footer-bottom">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
