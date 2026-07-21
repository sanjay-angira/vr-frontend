import Image from "next/image";
import Link from "next/link";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";

type HeaderLogoProps = {
  logoUrl: string | null;
  textColor: string;
};

export function HeaderLogo({ logoUrl, textColor }: HeaderLogoProps) {
  const logoSrc = logoUrl ? resolveImageUrl(logoUrl) : "";

  const content = logoSrc ? (
    <Image
      src={logoSrc}
      alt="Store logo"
      width={140}
      height={40}
      className="h-15 w-auto object-contain"
      priority
    />
  ) : (
    <>
      <span className="logo-text text-[30px] font-bold" style={{ color: textColor }}>
        Vrindavan Rasa
      </span>
    </>
  );

  return (
    <Link href="/" className="logo" style={{ color: textColor }}>
      {content}
    </Link>
  );
}
