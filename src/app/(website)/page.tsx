import { Suspense } from "react";
import { HomePage } from "@/components/website/home/HomePage";
import { HomePageSkeleton } from "@/components/website/shared/HomePageSkeleton";

export default function Page() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePage />
    </Suspense>
  );
}
