import { resolveLucideIcon } from "@/components/admin/layout/resolveLucideIcon";

type AdminNavIconProps = {
  /** Lucide icon name from database, e.g. "package", "layout-dashboard" */
  name: string;
  className?: string;
};

export function AdminNavIcon({ name, className = "h-5 w-5" }: AdminNavIconProps) {
  const Icon = resolveLucideIcon(name);

  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />;
}
