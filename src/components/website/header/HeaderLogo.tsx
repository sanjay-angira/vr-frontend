import Image from "next/image";
import Link from "next/link";


export function HeaderLogo() {
  return (
    <Link href="/" className="logo">
      <Image
        src="/logo/logo.svg"
        alt="Vrindavan Rasa"
        width={650}
        height={106}
        className="logo-image logo-image--desktop"
        priority
      />
      <Image
        src="/logo/logo.svg"
        alt="Vrindavan Rasa"
        width={650}
        height={106}
        className="logo-image logo-image--mobile"
        priority
      />
    </Link>
  );
}
