import { notFound } from "next/navigation";
import { WarehouseManagement } from "@/components/admin/warehouses/WarehouseManagement";

type BrandWarehousesPageProps = {
  params: Promise<{ brandId: string }>;
};

export default async function BrandWarehousesPage({
  params,
}: BrandWarehousesPageProps) {
  const { brandId } = await params;
  const parsedBrandId = Number(brandId);
  if (!Number.isInteger(parsedBrandId) || parsedBrandId <= 0) notFound();
  return <WarehouseManagement brandId={parsedBrandId} />;
}
