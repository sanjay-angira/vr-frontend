import { SectionHeading } from "@/components/website/shared/SectionHeading";
import { ProductGridSkeleton } from "@/components/website/shared/ProductGridSkeleton";

export default function RecentlyViewedLoading() {
  return (
    <section className="section home-section home-product-section">
      <div className="container">
        <SectionHeading
          title="Recently Viewed"
          accent="Products"
          description="Take a quick look at your recent favorites"
        />
        <ProductGridSkeleton count={8} />
      </div>
    </section>
  );
}
