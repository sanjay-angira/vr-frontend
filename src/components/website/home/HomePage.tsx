import { fetchHomepageSections } from "@/services/website/homepageService";
import { CmsHomeSections } from "@/components/website/home/CmsHomeSections";

export async function HomePage() {
  const sections = await fetchHomepageSections();

  if (sections.length === 0) {
    return (
      <div className="container" style={{ minHeight: "50vh", padding: "3rem 1rem" }}>
        <p style={{ textAlign: "center", color: "#7a6f61" }}>
          Homepage content is not available yet.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <CmsHomeSections sections={sections} />
    </div>
  );
}
