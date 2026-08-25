export type SectionHeadingProps = {
  /** Top label, e.g. "EXPLORE OUR RANGE" */
  eyebrow?: string;
  /** Main heading text (full title, or the part before the accent) */
  title: string;
  /** Accent-colored portion, e.g. "Categories" */
  accent?: string;
  /** Supporting line under the title */
  description?: string;
  className?: string;
  align?: "center" | "left";
  showDivider?: boolean;
};

function LeafMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden
      fill="currentColor"
    >
      <path d="M12 2c4.8 3.2 7.5 7.1 7.5 11.2 0 4.1-3.1 7.3-7.5 8.8-4.4-1.5-7.5-4.7-7.5-8.8C4.5 9.1 7.2 5.2 12 2Zm0 4.2c-2.6 2-4.2 4.4-4.2 7 0 2.4 1.6 4.4 4.2 5.4 2.6-1 4.2-3 4.2-5.4 0-2.6-1.6-5-4.2-7Z" />
    </svg>
  );
}

function splitTitle(title: string, accent?: string) {
  const trimmedTitle = title.trim();
  const trimmedAccent = accent?.trim();

  if (!trimmedAccent) {
    return { before: trimmedTitle, accent: "", after: "" };
  }

  const lowerTitle = trimmedTitle.toLowerCase();
  const lowerAccent = trimmedAccent.toLowerCase();
  const index = lowerTitle.lastIndexOf(lowerAccent);

  if (index >= 0) {
    return {
      before: trimmedTitle.slice(0, index).trimEnd(),
      accent: trimmedTitle.slice(index, index + trimmedAccent.length),
      after: trimmedTitle.slice(index + trimmedAccent.length).trimStart(),
    };
  }

  // Accent not found inside title — still show it in accent color after the title
  return {
    before: trimmedTitle,
    accent: trimmedAccent,
    after: "",
  };
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  className,
  align = "center",
  showDivider = true,
}: SectionHeadingProps) {
  const parts = splitTitle(title, accent);
  const showEyebrow = Boolean(eyebrow?.trim());
  const showDescription = Boolean(description?.trim());

  return (
    <header
      className={`section-header section-header--${align}${className ? ` ${className}` : ""}`}
    >
      {showEyebrow ? (
        <div className="section-eyebrow">
          <span className="section-eyebrow__line" aria-hidden />
          <span className="section-eyebrow__badge">
            {/* <LeafMark className="section-eyebrow__icon" /> */}
            <span className="section-eyebrow__text">{(eyebrow ?? "").trim()}</span>
          </span>
          <span className="section-eyebrow__line" aria-hidden />
        </div>
      ) : null}

      <h2 className="section-title">
        {parts.before ? (
          <span className="section-title__base">{parts.before}</span>
        ) : null}
        {parts.before && parts.accent ? " " : null}
        {parts.accent ? (
          <span className="section-title__accent">{parts.accent}</span>
        ) : null}
        {parts.after ? <> {parts.after}</> : null}
      </h2>

      {showDescription ? (
        <p className="section-description">{(description ?? "").trim()}</p>
      ) : null}

      {showDivider ? (
        <div className="section-divider" aria-hidden>
          <span className="section-divider__line" />
          <span className="section-divider__dot" />
          <LeafMark className="section-divider__icon" />
          <span className="section-divider__dot" />
          <span className="section-divider__line" />
        </div>
      ) : null}
    </header>
  );
}
