'use client';

import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useFooterData } from '@/hooks/useFooterData';
import { FooterLinkItem, FooterSection } from '@/types/footer';

function FooterLink({ item }: { item: FooterLinkItem }) {
  const href = item.url?.trim() || '#';
  const isExternal = href.startsWith('http');

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="footer-link">
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

function ContactSection({ section, email, phone, address }: { section: FooterSection; email?: string; phone?: string; address?: string }) {
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
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="footer-link">
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

function SocialSection({ section }: { section: FooterSection }) {
  if (!section.socialLinks.length) return null;

  return (
    <div className="footer-section">
      <h3 className="footer-section-title">{section.title}</h3>
      <div className="footer-social-grid">
        {section.socialLinks.map((link) => {
          const href = link.url?.trim() || '#';
          return (
            <a
              key={link.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label={link.label}
              title={link.label}
            >
              {link.icon ? (
                <img src={link.icon} alt={link.label} className="footer-social-icon" />
              ) : (
                <span>{link.label}</span>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function PaymentSection({ section }: { section: FooterSection }) {
  if (!section.paymentMethods.length) return null;

  return (
    <div className="footer-section footer-payment-section">
      <h3 className="footer-section-title">{section.title}</h3>
      <div className="footer-payment-grid">
        {section.paymentMethods.map((method) => (
          <div key={method.id} className="footer-payment-item" title={method.label}>
            {method.icon ? (
              <img src={method.icon} alt={method.label} className="footer-payment-icon" />
            ) : (
              <span className="footer-payment-label">{method.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const Footer = () => {
  const { footerData, loading } = useFooterData();
  const { settings, sections } = footerData;

  const menuSections = sections.filter((section) => section.type === 'menu');
  const contactSections = sections.filter((section) => section.type === 'contact');
  const socialSections = sections.filter((section) => section.type === 'social');
  const paymentSections = sections.filter((section) => section.type === 'payment');

  const copyright =
    settings?.copyrightText ||
    `© ${new Date().getFullYear()} Sacred Store. All rights reserved.`;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">🕉</div>
              <span className="footer-logo-text">Sacred Store</span>
            </div>
            <p className="footer-brand-text">
              Your trusted source for authentic spiritual products, blessed items, and sacred literature.
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

              {socialSections.map((section) => (
                <SocialSection key={section.id} section={section} />
              ))}
            </>
          )}
        </div>

        {!loading && paymentSections.length > 0 && (
          <div className="footer-payments-row">
            {paymentSections.map((section) => (
              <PaymentSection key={section.id} section={section} />
            ))}
          </div>
        )}

        <div className="footer-bottom">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
