import Image from "next/image";

type SectionCornersVariant = "default" | "ornate";

type SectionCornersProps = {
  /** `default` = corner.png; `ornate` = corner2.png (Why Choose + Reviews) */
  variant?: SectionCornersVariant;
};

const CORNER_SRC: Record<SectionCornersVariant, string> = {
  default: "/corner.png",
  ornate: "/corner2.png",
};

/**
 * Decorative TL + BR gold corner ornaments for homepage content sections.
 */
export function SectionCorners({ variant = "default" }: SectionCornersProps) {
  const src = CORNER_SRC[variant];

  return (
    <div className="section-corners" aria-hidden>
      <span className="section-corners__piece section-corners__piece--tl">
        <Image
          src={src}
          alt=""
          width={1536}
          height={1024}
          sizes="(max-width: 640px) 110px, 180px"
          className="section-corners__img"
          priority={false}
        />
      </span>
      <span className="section-corners__piece section-corners__piece--br">
        <Image
          src={src}
          alt=""
          width={1536}
          height={1024}
          sizes="(max-width: 640px) 110px, 180px"
          className="section-corners__img"
          priority={false}
        />
      </span>
    </div>
  );
}
