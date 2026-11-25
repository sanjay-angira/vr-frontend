import type { StoreListProduct } from "@/types/storeProduct";

export type HomepageBanner = {
  id: number;
  desktopImage: string;
  tabletImage: string;
  mobileImage: string;
  link: string;
};

export type HomepageProductSection = {
  slug: string;
  title: string;
  products: StoreListProduct[];
};

export type HomepageSectionCopy = {
  slug: string;
  title: string;
  type: string;
  position: number;
  heading: string;
  subHeading: string;
  headingAccent: string;
  description: string;
  maxProducts: number;
  customSection?: string;
};
