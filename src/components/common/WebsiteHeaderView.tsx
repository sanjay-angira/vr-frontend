import { AnnouncementBar } from "@/components/website/header/AnnouncementBar";
import { DesktopNavigation } from "@/components/website/header/DesktopNavigation";
import { HeaderStaticActions } from "@/components/website/header/HeaderStaticActions";
import type { WebsiteHeaderData } from "@/types/header";
import { HeaderLogo } from "../website/header/HeaderLogo";

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
        <div className="container">
          <div className="header-content">
            <HeaderLogo
              logoUrl={header.logoUrl}
              mobileLogoUrl={header.mobileLogoUrl}
              textColor={header.textColor}
            />
            <DesktopNavigation items={menu} textColor={header.textColor} />
            <div className="header-actions">
              <HeaderStaticActions settings={header} />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
