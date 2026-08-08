import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import type { FooterData, FooterLinkItem, FooterSection } from "@/types/footer";
import {
  buildDisplaySections,
  buildFooterGridSections,
  collectSocialLinks,
  getSectionLinks,
} from "@/utils/footerHelpers";

type WebsiteFooterViewProps = {
  data: FooterData;
  isPreview?: boolean;
};

type SectionProps = {
  section: FooterSection;
  isPreview?: boolean;
  settings?: FooterData["settings"];
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

function IconTile({
  label,
  iconUrl,
  isPreview,
  href,
  className,
  imageClassName,
}: {
  label: string;
  iconUrl: string;
  isPreview: boolean;
  href?: string;
  className: string;
  imageClassName: string;
}) {
  const safeIconUrl = iconUrl.trim();
  const content = safeIconUrl ? (
    <Image
      src={safeIconUrl}
      alt={label}
      width={150}
      height={100}
      className={imageClassName}
      unoptimized
    />
  ) : (
    <span className="footer-payment-label">{label}</span>
  );

  if (isPreview || !href) {
    return (
      <span className={className} title={label}>
        {content}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={label}
    >
      {content}
    </a>
  );
}

function MenuSection({ section, isPreview = false }: SectionProps) {
  const items = getSectionLinks(section);
  if (!items.length) return null;

  return (
    <div className="footer-section">
      <h3 className="footer-section-title">{section.title}</h3>
      <ul className="footer-link-list">
        {items.map((item) => (
          <li key={item.id}>
            <FooterLink item={item} isPreview={isPreview} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIconGrid({
  links,
  isPreview = false,
}: {
  links: FooterLinkItem[];
  isPreview?: boolean;
}) {
  return (
    <div className="footer-social-grid">
      {links.map((link) => (
        <IconTile
          key={link.id}
          label={link.label}
          iconUrl={link.icon ? resolveImageUrl(link.icon) : ""}
          href={link.url}
          isPreview={isPreview}
          className="footer-social-link"
          imageClassName="footer-social-icon"
        />
      ))}
    </div>
  );
}

function ContactSection({
  section,
  settings,
  isPreview = false,
  socialLinks = [],
  socialTitle = "Follow Us",
}: SectionProps & {
  socialLinks?: FooterLinkItem[];
  socialTitle?: string;
}) {
  const email = settings?.email;
  const phone = settings?.phone;
  const address = settings?.address;
  const hasSettings = Boolean(email || phone || address);
  const hasItems = (section.items ?? []).length > 0;
  const hasSocial = socialLinks.length > 0;

  const hasContactContent = hasSettings || hasItems;

  if (!hasContactContent && !hasSocial) return null;

  return (
    <div className="footer-section">
      {hasContactContent && (
        <>
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
        </>
      )}
      {hasSocial && (
        <div className={hasContactContent ? "footer-social-block" : undefined}>
          <h3 className="footer-section-title">{socialTitle}</h3>
          <SocialIconGrid links={socialLinks} isPreview={isPreview} />
        </div>
      )}
    </div>
  );
}

function PaymentSection({ section, isPreview = false }: SectionProps) {
  const methods = getSectionLinks(section);
  if (!methods.length) return null;

  return (
    <div className="footer-section">
      <h3 className="footer-section-title">{section.title}</h3>
      <div className="footer-payment-grid">
        {methods.map((method) => (
          <div key={method.id} className="footer-payment-item" title={method.label}>
            <IconTile
              label={method.label}
              iconUrl={method.icon ? resolveImageUrl(method.icon) : ""}
              isPreview={isPreview}
              className="footer-payment-icon-wrap"
              imageClassName="footer-payment-icon"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function renderFooterSection(
  section: FooterSection,
  settings: FooterData["settings"],
  isPreview: boolean,
  socialBlock?: { links: FooterLinkItem[]; title: string }
) {
  switch (section.type) {
    case "menu":
      return (
        <MenuSection key={section.id} section={section} isPreview={isPreview} />
      );
    case "contact":
      return (
        <ContactSection
          key={section.id}
          section={section}
          settings={settings}
          isPreview={isPreview}
          socialLinks={socialBlock?.links}
          socialTitle={socialBlock?.title}
        />
      );
    case "payment":
      return (
        <PaymentSection key={section.id} section={section} isPreview={isPreview} />
      );
    default:
      return null;
  }
}

export function WebsiteFooterView({ data, isPreview = false }: WebsiteFooterViewProps) {
  const { settings, sections = [] } = data;
  const displaySections = buildDisplaySections(sections, settings);
  const gridSections = buildFooterGridSections(sections, settings);
  const { links: socialLinks, title: socialTitle } = collectSocialLinks(displaySections);
  let socialAttached = false;

  const copyright =
    settings?.copyrightText ||
    `© ${new Date().getFullYear()} Vrindavan Rasa. All rights reserved.`;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {gridSections.map((section) => {
            const attachSocial =
              section.type === "contact" && !socialAttached && socialLinks.length > 0;
            if (attachSocial) socialAttached = true;

            return renderFooterSection(
              section,
              settings,
              isPreview,
              attachSocial ? { links: socialLinks, title: socialTitle } : undefined
            );
          })}
        </div>

        <div className="footer-bottom">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
