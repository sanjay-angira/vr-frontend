
import { AnnouncementBar } from "./AnnouncementBar";
import { Header } from "./Header";
import { fetchWebsiteHeader } from "@/services/website/headerService";

export async function WebsiteHeader() {
  const data = await fetchWebsiteHeader();
  // console.log(data);
  return (
    <>
      <AnnouncementBar data={data.announcementBar} />
      <Header settings={data.header} menu={data.menu} />
    </>
  );
}
