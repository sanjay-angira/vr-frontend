import Link from "next/link";
import type { AnnouncementBarData } from "@/types/header";

type AnnouncementBarProps = {
  data: AnnouncementBarData | null;
};

function AnnouncementMessage({ data }: { data: AnnouncementBarData }) {
  return (
    <p className="announcement-bar-message" style={{ color: data.textColor }}>
      {data.message}
      {data.linkText && data.linkUrl ? (
        <>
          {" "}
          <Link
            href={data.linkUrl}
            className="announcement-bar-link"
            style={{ color: data.textColor }}
          >
            {data.linkText}
          </Link>
        </>
      ) : null}
    </p>
  );
}

export function AnnouncementBar({ data }: AnnouncementBarProps) {
  if (!data?.isActive || !data.message) {
    return null;
  }

  return (
    <div
      className="announcement-bar"
      style={{
        backgroundColor: data.backgroundColor,
        color: data.textColor,
        ["--announcement-bg" as string]: data.backgroundColor,
        ["--announcement-text" as string]: data.textColor,
      }}
    >
      {/* Desktop: centered static message */}
      <div className="container announcement-bar-desktop">
        <div className="announcement-bar-content">
          <AnnouncementMessage data={data} />
        </div>
      </div>

      {/* Mobile: right → left marquee (two identical halves for a seamless loop) */}
      <div className="announcement-bar-marquee" aria-hidden="true">
        <div className="announcement-bar-marquee-track">
          <div className="announcement-bar-marquee-group">
            <AnnouncementMessage data={data} />
            <AnnouncementMessage data={data} />
          </div>
          <div className="announcement-bar-marquee-group">
            <AnnouncementMessage data={data} />
            <AnnouncementMessage data={data} />
          </div>
        </div>
      </div>

      <span className="sr-only">
        {data.message}
        {data.linkText ? ` ${data.linkText}` : ""}
      </span>
    </div>
  );
}
