import type { WebsiteHeaderData } from "@/types/header";
import { AnnouncementBar } from "./AnnouncementBar";
import { Header } from "./Header";

type WebsiteHeaderSectionProps = {
  data: WebsiteHeaderData;
};

export function WebsiteHeaderSection({ data }: WebsiteHeaderSectionProps) {
  return (
    <>
      <AnnouncementBar data={data.announcementBar} />
      <Header settings={data.header} menu={data.menu} />
    </>
  );
}
