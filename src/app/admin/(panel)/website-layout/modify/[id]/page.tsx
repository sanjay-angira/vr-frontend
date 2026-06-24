import { SectionSettingsPage } from "@/components/admin/website-layout/SectionSettingsPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <SectionSettingsPage sectionId={id} />;
}
