import Image from "next/image";
import Link from "next/link";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import { DEFAULT_STORE_LOGO } from "@/lib/site";

type HeaderLogoProps = {
  logoUrl: string | null;
  mobileLogoUrl?: string | null;
  textColor: string;
};

function resolveLogoSrc(url: string | null | undefined): string {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return DEFAULT_STORE_LOGO;
  if (trimmed.startsWith("/")) return trimmed;
  return resolveImageUrl(trimmed);
}

export function HeaderLogo({
  logoUrl,
  mobileLogoUrl = null,
  textColor,
}: HeaderLogoProps) {
  const desktopSrc = resolveLogoSrc(logoUrl);
  const mobileSrc = resolveLogoSrc(mobileLogoUrl || logoUrl);

  return (
    <Link href="/" className="logo" style={{ color: textColor }}>
      <Image
        src={desktopSrc}
        alt="Vrindavan Rasa"
        width={280}
        height={64}
        className="logo-image logo-image--desktop"
        priority
      />
      <Image
        src={mobileSrc}
        alt="Vrindavan Rasa"
        width={220}
        height={48}
        className="logo-image logo-image--mobile"
        priority
      />
    </Link>
  );
}
