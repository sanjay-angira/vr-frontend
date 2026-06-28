import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import type { FooterData, FooterLinkItem, FooterSection } from "@/types/footer";

type WebsiteFooterViewProps = {
  data: FooterData;
  isPreview?: boolean;
};

function FooterLink({
  item,
  isPreview = false,
}: {
  item: FooterLinkItem;
  isPreview?: boolean;
}) {
  const href = item.url?.trim() || "#";
  const isExternal = href.startsWith("http");

  if (isPreview) {
    return <span className="footer-link">{item.label}</span>;
  }

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

function MenuSection({
  section,
  isPreview = false,
}: {
  section: FooterSection;
  isPreview?: boolean;
}) {
  if (!section.items?.length) return null;

  return (
    <div className="footer-section">
      <h3 className="footer-section-title">{section.title}</h3>
      <ul className="footer-link-list">
        {section.items.map((item) => (
          <li key={item.id}>
            <FooterLink item={item} isPreview={isPreview} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialSection({
  section,
  isPreview = false,
}: {
  section: FooterSection;
  isPreview?: boolean;
}) {
  const links =
    section.socialLinks?.length > 0 ? section.socialLinks : section.items ?? [];

  if (!links.length) return null;

  return (
    <div className="footer-section">
      <h3 className="footer-section-title">{section.title}</h3>
      <div className="footer-social-grid">
        {links.map((link) => {
          const iconUrl = link.icon ? resolveImageUrl(link.icon) : "";

          if (isPreview) {
            return (
              <span key={link.id} className="footer-social-link" title={link.label}>
                {iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={iconUrl} alt={link.label} className="footer-social-icon" />
                ) : (
                  <span className="footer-payment-label">{link.label}</span>
                )}
              </span>
            );
          }

          return (
            <a
              key={link.id}
              href={link.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              title={link.label}
            >
              {iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={iconUrl} alt={link.label} className="footer-social-icon" />
              ) : (
                <span className="footer-payment-label">{link.label}</span>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function ContactSection({
  section,
  email,
  phone,
  address,
  isPreview = false,
}: {
  section: FooterSection;
  email?: string;
  phone?: string;
  address?: string;
  isPreview?: boolean;
}) {
  const hasSettings = Boolean(email || phone || address);
  const hasItems = (section.items ?? []).length > 0;

  if (!hasSettings && !hasItems) return null;

  return (
    <div className="footer-section">
      <h3 className="footer-section-title">{section.title}</h3>
      <ul className="footer-contact-list">
        {phone && (
          <li>
            <Phone size={16} />
            {isPreview ? (
              <span className="footer-link">{phone}</span>
            ) : (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="footer-link">
                {phone}
              </a>
            )}
          </li>
        )}
        {email && (
          <li>
            <Mail size={16} />
            {isPreview ? (
              <span className="footer-link">{email}</span>
            ) : (
              <a href={`mailto:${email}`} className="footer-link">
                {email}
              </a>
            )}
          </li>
        )}
        {address && (
          <li>
            <MapPin size={16} />
            <span>{address}</span>
          </li>
        )}
        {(section.items ?? []).map((item) => (
          <li key={item.id}>
            <FooterLink item={item} isPreview={isPreview} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PaymentSection({
  section,
  isPreview = false,
}: {
  section: FooterSection;
  isPreview?: boolean;
}) {
  const methods =
    section.paymentMethods?.length > 0
      ? section.paymentMethods
      : section.items ?? [];

  if (!methods.length) return null;

  return (
    <div className="footer-section">
      <h3 className="footer-section-title">{section.title}</h3>
      <div className="footer-payment-grid">
        {methods.map((method) => {
          const iconUrl = method.icon ? resolveImageUrl(method.icon) : "";

          return (
            <div key={method.id} className="footer-payment-item" title={method.label}>
              {iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={iconUrl} alt={method.label} className="footer-payment-icon" width={150} height={100} />
              ) : (
                <span className="footer-payment-label">{method.label}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderSection(
  section: FooterSection,
  settings: FooterData["settings"],
  isPreview: boolean
) {
  switch (section.type) {
    case "menu":
      return (
        <MenuSection key={section.id} section={section} isPreview={isPreview} />
      );
    case "social":
      return (
        <SocialSection key={section.id} section={section} isPreview={isPreview} />
      );
    case "contact":
      return (
        <ContactSection
          key={section.id}
          section={section}
          email={settings?.email}
          phone={settings?.phone}
          address={settings?.address}
          isPreview={isPreview}
        />
      );
    default:
      return null;
  }
}

export function WebsiteFooterView({ data, isPreview = false }: WebsiteFooterViewProps) {
  const { settings, sections = [] } = data;

  const sortedSections = [...sections].sort((a, b) => a.position - b.position);
  const gridSections = sortedSections.filter((section) => section.type !== "payment" && section.type !== "social");

  const socialSections = sortedSections.filter((section) => section.type === "social");
  const paymentSections = sortedSections.filter((section) => section.type === "payment");

  const hasContactSection = gridSections.some((section) => section.type === "contact");
  const hasSettingsContact = Boolean(settings?.email || settings?.phone || settings?.address);

  const copyright =
    settings?.copyrightText ||
    `© ${new Date().getFullYear()} Vrindavan Rasa. All rights reserved.`;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-lead-column">
            {!hasContactSection && hasSettingsContact && (
              <ContactSection
                section={{
                  id: 0,
                  title: "Contact Us",
                  type: "contact",
                  position: 999,
                  items: [],
                  socialLinks: [],
                  paymentMethods: [],
                }}
                email={settings?.email}
                phone={settings?.phone}
                address={settings?.address}
                isPreview={isPreview}
              />
            )}
            {socialSections.map((section) => renderSection(section, settings, isPreview))}
          </div>


          {gridSections.map((section) => renderSection(section, settings, isPreview))}
          {paymentSections.map((section) => (
            <PaymentSection key={section.id} section={section} isPreview={isPreview} />
          ))}
        </div>


        <div className="footer-bottom">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
