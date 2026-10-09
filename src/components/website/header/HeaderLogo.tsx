import Image from "next/image";
import Link from "next/link";


export function HeaderLogo() {
  return (
    <Link href="/" className="logo">
      <Image
        src='/logo/logo.png'
        alt="Vrindavan Rasa"
        width={280}
        height={64}
        className="logo-image logo-image--desktop"
        priority
      />
      <Image
        src='/logo/logo.png'
        alt="Vrindavan Rasa"
        width={220}
        height={48}
        className="logo-image logo-image--mobile"
        priority
      /> 
    </Link>
  );
}
