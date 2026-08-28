import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { FooterData, FooterLinkItem, FooterSection } from "@/types/footer";
import { STATIC_FOOTER_SOCIAL } from "@/types/footer";
import { getSectionLinks, sortByPosition } from "@/utils/footerHelpers";
import razorpayLogo from "@/assets/icons/Razorpay.svg";
import facebookIcon from "@/assets/icons/facebook.svg";
import instagramIcon from "@/assets/icons/instagram.svg";
import xIcon from "@/assets/icons/twitter-x.svg";
import pinterestIcon from "@/assets/icons/pinterest.svg";
import youtubeIcon from "@/assets/icons/youtube.svg";

type WebsiteFooterViewProps = {
  data: FooterData;
};

type SectionProps = {
  section: FooterSection;
  settings?: FooterData["settings"];
};

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

function MenuSection({ section }: SectionProps) {
  const items = getSectionLinks(section);
  if (!items.length) return null;

  return (
    <div className="footer-section">
      <h3 className="footer-section-title">{section.title}</h3>
      <ul className="footer-link-list">
        {items.map((item) => (
          <li key={item.id}>
            <FooterLink item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

const STATIC_SOCIAL_ICONS = {
  facebook: facebookIcon,
  instagram: instagramIcon,
  x: xIcon,
  pinterest: pinterestIcon,
  youtube: youtubeIcon,
} as const;

function StaticSocialLink({
  id,
  label,
  url,
}: {
  id: keyof typeof STATIC_SOCIAL_ICONS;
  label: string;
  url: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="footer-social-link"
      aria-label={label}
      title={label}
    >
      <Image
        src={STATIC_SOCIAL_ICONS[id]}
        alt=""
        width={22}
        height={22}
        className="footer-social-icon footer-social-icon--asset"
        unoptimized
      />
    </a>
  );
}

function ContactSection({ section, settings }: SectionProps) {
  const email = settings?.email;
  const phone = settings?.phone;
  const address = settings?.address;
  const hasSettings = Boolean(email || phone || address);
  const hasItems = (section.items ?? []).length > 0;
  const hasContactContent = hasSettings || hasItems;

  return (
    <div className="footer-section">
      {hasContactContent && (
        <>
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
            {(section.items ?? []).map((item) => (
              <li key={item.id}>
                <FooterLink item={item} />
              </li>
            ))}
          </ul>
        </>
      )}
      <div className={hasContactContent ? "footer-social-block" : undefined}>
        <h3 className="footer-section-title">Follow Us</h3>
        <div className="footer-social-grid">
          {STATIC_FOOTER_SOCIAL.map((item) => (
            <StaticSocialLink
              key={item.id}
              id={item.id}
              label={item.label}
              url={item.url}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function renderFooterSection(
  section: FooterSection,
  settings: FooterData["settings"]
) {
  switch (section.type) {
    case "menu":
      return <MenuSection key={section.id} section={section} />;
    case "contact":
      return (
        <ContactSection
          key={section.id}
          section={section}
          settings={settings}
        />
      );
    default:
      return null;
  }
}

export function WebsiteFooterView({ data }: WebsiteFooterViewProps) {
  const { settings, sections = [] } = data;
  const gridSections = sortByPosition(sections);
  const copyright =
    settings?.copyrightText ||
    `© ${new Date().getFullYear()} Vrindavan Rasa. All rights reserved.`;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {gridSections.map((section) => renderFooterSection(section, settings))}
        </div>

        <div className="footer-bottom">
          <p>{copyright}</p>
          <div className="footer-razorpay" title="Payments by Razorpay">
            <Image
              src={razorpayLogo}
              alt="Razorpay"
              className="footer-razorpay-icon"
              width={95}
              height={20}
              unoptimized
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
