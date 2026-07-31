import { AnnouncementBar } from "@/components/website/header/AnnouncementBar";
import { WebsiteHeaderBar } from "@/components/website/header/WebsiteHeaderBar";
import type { WebsiteHeaderData } from "@/types/header";

type WebsiteHeaderViewProps = {
  data: WebsiteHeaderData;
};

export function WebsiteHeaderView({ data }: WebsiteHeaderViewProps) {
  const { announcementBar, header, menu } = data;

  return (
    <>
      <AnnouncementBar data={announcementBar} />
      <header
        className="header"
        style={{
          position: header.stickyHeader ? "sticky" : "relative",
          top: header.stickyHeader ? 0 : undefined,
          backgroundColor: header.backgroundColor,
          color: header.textColor,
          ["--header-bg" as string]: header.backgroundColor,
          ["--header-text" as string]: header.textColor,
        }}
      >
        <WebsiteHeaderBar header={header} menu={menu} />
      </header>
    </>
  );
}
