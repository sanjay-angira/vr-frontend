import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { FooterData, FooterLinkItem, FooterSection } from "@/types/footer";
import { STATIC_FOOTER_SOCIAL } from "@/types/footer";
import { getSectionLinks, sortByPosition } from "@/utils/footerHelpers";
import razorpayLogo from "../../../public/social-icons/Razorpay.svg";
import facebookIcon from "../../../public/social-icons/facebook.svg";
import instagramIcon from "../../../public/social-icons/instagram.svg";
import xIcon from "../../../public/social-icons/twitter-x.svg";
import pinterestIcon from "../../../public/social-icons/pinterest.svg";
import youtubeIcon from "../../../public/social-icons/youtube.svg";

type WebsiteFooterViewProps = {
  data: FooterData;
};

function FooterLink({ item }: { item: FooterLinkItem }) {
  const href = item.url?.trim() || "#";
  const isExternal = /^(https?:|mailto:|tel:)/i.test(href);

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
  console.log("Rendering MenuSection for section:", section);
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

function renderFooterSection(section: FooterSection) {
  return section.type === "menu" ? (
    <MenuSection key={section.id} section={section} />
  ) : null;
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
          <div className="footer-section">
            <h3 className="footer-section-title">Contact Us</h3>
            <ul className="footer-contact-list">
              <li>
                <Phone size={16} />
                <a href="tel:+919410855992" className="footer-link">
                  +91 9410855992
                </a>
              </li>
              <li>
                <Mail size={16} />
                <a
                  href="mailto:vrindavanrasa@gmail.com"
                  className="footer-link"
                >
                  vrindavanrasa@gmail.com
                </a>
              </li>
              <li>
                <MapPin size={16} />
                <span>Mathura, India</span>
              </li>
            </ul>

            <div className="footer-social-block">
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
          {gridSections.map((section) => renderFooterSection(section))}
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
