import type { Metadata } from "next";
import { ContactUsPage } from "@/components/website/contact/ContactUsPage";
import { JsonLd } from "@/components/website/seo/JsonLd";
import { getBreadcrumbSchema, getContactPageSchema } from "@/lib/schema";
import { getStaticPageMetadata } from "@/lib/seo";

export const metadata: Metadata = getStaticPageMetadata("contact");

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          getContactPageSchema(),
          getBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact Us", path: "/contact-us" },
          ]),
        ]}
      />
      <ContactUsPage />
    </>
  );
}
