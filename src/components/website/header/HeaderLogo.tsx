import Image from "next/image";
import Link from "next/link";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";

type HeaderLogoProps = {
  logoUrl: string | null;
  mobileLogoUrl?: string | null;
  textColor: string;
};

export function HeaderLogo({
  logoUrl,
  mobileLogoUrl = null,
  textColor,
}: HeaderLogoProps) {
  const desktopSrc = logoUrl ? resolveImageUrl(logoUrl) : "";
  const mobileSrc = mobileLogoUrl
    ? resolveImageUrl(mobileLogoUrl)
    : desktopSrc;

  const fallbackText = (
    <span
      className="logo-text text-[30px] font-bold"
      style={{ color: textColor }}
    >
      Vrindavan Rasa
    </span>
  );

  return (
    <Link href="/" className="logo" style={{ color: textColor }}>
      {desktopSrc ? (
        <Image
          src={desktopSrc}
          alt="Store logo"
          width={140}
          height={40}
          className="logo-image logo-image--desktop h-15 w-auto object-contain"
          priority
        />
      ) : (
        <span className="logo-fallback logo-fallback--desktop">{fallbackText}</span>
      )}

      {mobileSrc ? (
        <Image
          src={mobileSrc}
          alt="Store logo"
          width={120}
          height={36}
          className="logo-image logo-image--mobile h-10 w-auto object-contain"
          priority
        />
      ) : (
        <span className="logo-fallback logo-fallback--mobile">{fallbackText}</span>
      )}
    </Link>
  );
}
