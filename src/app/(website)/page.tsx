import { Suspense } from "react";
import { HomePageSkeleton } from "@/components/website/shared/HomePageSkeleton";
import { HomePageSections } from "@/components/website/home/HomePageSections";
import { fetchHomepageSections } from "@/services/website/homepageService";

export default async function Page() {
  const sections = await fetchHomepageSections();
  console.dir(sections,{dep:null})
  
  if (sections.length === 0) {
    return (
      <div className="container home-empty">
        <p className="home-empty__message">
          Homepage content is not available yet.
        </p>
      </div>
    );
  }
   return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageSections sections={sections} />
    </Suspense>
  );
}
