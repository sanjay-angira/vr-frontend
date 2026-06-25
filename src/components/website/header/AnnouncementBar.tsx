import Link from "next/link";
import type { AnnouncementBarData } from "@/types/header";

type AnnouncementBarProps = {
  data: AnnouncementBarData | null;
};

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
      <div className="container">
        <div
          className="announcement-bar-content"
          style={{ justifyContent: "center", height: "40px" }}
        >
          <p className="m-0 text-center text-sm font-medium" style={{ color: data.textColor }}>
            {data.message}
            {data.linkText && data.linkUrl ? (
              <>
                {" "}
                <Link
                  href={data.linkUrl}
                  className="underline underline-offset-2 transition-opacity hover:opacity-80"
                  style={{ color: data.textColor }}
                >
                  {data.linkText}
                </Link>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
}
