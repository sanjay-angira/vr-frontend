import type { DataTableColumn } from "@/components/common/DataTable";
import type { AdminTableColumnDefinition } from "@/components/admin/commonTable/staticAdminTableColumns";

export type ModuleTableRow = Record<string, unknown> & { id?: string | number };

function getNestedValue(row: ModuleTableRow, key: string): unknown {
  return key.split(".").reduce<unknown>((value, part) => {
    if (value && typeof value === "object" && part in value) {
      return (value as Record<string, unknown>)[part];
    }
    return undefined;
  }, row);
}

function roundDiscount(value: unknown): string {
  if (value === null || value === undefined) return "";
  const numValue = typeof value === "string" ? parseFloat(value) : Number(value);
  if (Number.isNaN(numValue)) return "";
  return Math.round(numValue).toString();
}

function formatMediumDate(value: unknown): string {
  if (!value) return "NA";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "NA";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatRelativeDate(value: unknown): string {
  if (!value) return "NA";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "NA";

  const seconds = Math.round(Math.abs((Date.now() - date.getTime()) / 1000));
  const minutes = Math.round(Math.abs(seconds / 60));
  const hours = Math.round(Math.abs(minutes / 60));
  const days = Math.round(Math.abs(hours / 24));
  const months = Math.round(Math.abs(days / 30.416));
  const years = Math.round(Math.abs(days / 365));

  if (seconds <= 45) return "a few seconds ago";
  if (seconds <= 90) return "a minute ago";
  if (minutes <= 45) return `${minutes} minutes ago`;
  if (minutes <= 90) return "an hour ago";
  if (hours <= 22) return `${hours} hours ago`;
  if (hours <= 36) return "a day ago";
  if (days <= 25) return `${days} days ago`;
  if (days <= 45) return "a month ago";
  if (days <= 345) return `${months} months ago`;
  if (days <= 545) return "a year ago";
  return `${years} years ago`;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function getRoleNames(element: ModuleTableRow, property: string): string[] {
  const userRoles = element.userRoles;
  if (Array.isArray(userRoles) && userRoles.length > 0) {
    return userRoles
      .map((userRole) => {
        if (userRole && typeof userRole === "object" && "role" in userRole) {
          const role = (userRole as { role?: { roleName?: string } }).role;
          return role?.roleName;
        }
        return undefined;
      })
      .filter((roleName): roleName is string => Boolean(roleName));
  }

  const propertyValue = element[property];
  if (Array.isArray(propertyValue)) {
    return propertyValue.filter((roleName): roleName is string => Boolean(roleName));
  }

  if (typeof propertyValue === "string" && propertyValue.trim()) {
    return propertyValue
      .split(",")
      .map((roleName) => roleName.trim())
      .filter(Boolean);
  }

  return [];
}

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "green" | "red" | "cyan" | "orange" | "default";
}) {
  const className =
    variant === "green"
      ? "bg-emerald-50 text-emerald-700"
      : variant === "red"
        ? "bg-red-50 text-red-700"
        : variant === "cyan"
          ? "bg-cyan-50 text-cyan-800"
          : variant === "orange"
            ? "bg-orange-50 text-orange-700"
            : "bg-zinc-100 text-zinc-700";

  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function StatusBadge({ value }: { value: unknown }) {
  const isActive = value === true || value === "true";
  return (
    <Badge variant={isActive ? "green" : "red"}>
      {isActive ? "Active" : "In-Active"}
    </Badge>
  );
}

function OnOffBadge({ value }: { value: unknown }) {
  const isOn = value === true || value === "true";
  return (
    <Badge variant={isOn ? "green" : "red"}>{isOn ? "On" : "Off"}</Badge>
  );
}

function ContactLeadStatusBadge({ value }: { value: unknown }) {
  const status = String(value ?? "").toLowerCase();
  if (status === "resolved") return <Badge variant="green">Resolved</Badge>;
  if (status === "contacted") return <Badge variant="orange">Contacted</Badge>;
  if (status === "new") return <Badge variant="cyan">New</Badge>;
  return <Badge variant="cyan">{titleCase(status || "NA")}</Badge>;
}

function PublishStatusBadge({ value }: { value: unknown }) {
  const status = String(value ?? "").toLowerCase();
  if (status === "published") return <Badge variant="green">Published</Badge>;
  if (status === "draft") return <Badge variant="cyan">Draft</Badge>;
  if (status === "scheduled") return <Badge variant="orange">Scheduled</Badge>;
  if (status === "archived") return <Badge variant="red">Archived</Badge>;
  return <Badge variant="cyan">{titleCase(status || "NA")}</Badge>;
}

function RoleBadges({ row, property }: { row: ModuleTableRow; property: string }) {
  const roles = getRoleNames(row, property);
  if (roles.length === 0) {
    return <span className="text-slate-400">NA</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((roleName) => {
        const normalized = roleName.trim().toLowerCase();
        const variant =
          normalized === "admin"
            ? "green"
            : normalized === "user"
              ? "cyan"
              : "default";
        return (
          <Badge key={roleName} variant={variant}>
            {roleName}
          </Badge>
        );
      })}
    </div>
  );
}

function RatingStars({ value }: { value: unknown }) {
  const rating = Number(value);
  if (Number.isNaN(rating)) return <span>NA</span>;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-4 w-4 ${star <= rating ? "text-yellow-400" : "text-slate-300"}`}
        />
      ))}
      <span className="ml-2 text-sm text-gray-500">({rating.toFixed(1)})</span>
    </div>
  );
}

function DateCell({ value }: { value: unknown }) {
  const relative = formatRelativeDate(value);
  const full = formatMediumDate(value);
  return (
    <span title={full} className="cursor-default">
      <Badge variant="green">{relative}</Badge>
    </span>
  );
}

function TimeCell({ value }: { value: unknown }) {
  return <Badge variant="green">{formatMediumDate(value)}</Badge>;
}

function ImageCell({ value }: { value: unknown }) {
  const src = String(value ?? "");
  if (!src) return <span>NA</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="h-14 w-auto rounded-md p-1 object-cover" />
  );
}

function ColorCell({ value }: { value: unknown }) {
  const color = String(value ?? "");
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-5 w-5 rounded border border-gray-300"
        style={{ backgroundColor: color || "transparent" }}
      />
      <span>{color || "-"}</span>
    </div>
  );
}

function DefaultCell({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <span>NA</span>;
  }
  return <span>{String(value)}</span>;
}

export function renderAdminCell(
  row: ModuleTableRow,
  column: AdminTableColumnDefinition
): React.ReactNode {
  const value = getNestedValue(row, column.property);

  switch (column.datatype) {
    case "button":
      return null;
    case "id":
      return <span>#{String(value ?? "NA")}</span>;
    case "productName": {
      const product = row.product as { productName?: string } | undefined;
      return (
        <span>{product?.productName ?? String(value ?? "No Product")}</span>
      );
    }
    case "parentCategory": {
      const parent = row.parent as { categoryName?: string } | undefined;
      return <span>{parent?.categoryName ?? "N/A"}</span>;
    }
    case "childCategories": {
      const children = row.children as Array<{ categoryName?: string }> | undefined;
      if (Array.isArray(children) && children.length > 0) {
        return (
          <span>
            {children
              .map((child) => child.categoryName)
              .filter(Boolean)
              .join(", ")}
          </span>
        );
      }
      return <span>N/A</span>;
    }
    case "discountValue": {
      const discount = roundDiscount(value);
      if (!discount) return <span>NA</span>;
      const discountType = String(row.discountType ?? row.type ?? "").toLowerCase();
      return (
        <span>{discountType === "fixed" ? `₹${discount}` : `${discount}%`}</span>
      );
    }
    case "status":
      return <StatusBadge value={value} />;
    case "on-off":
      return <OnOffBadge value={value} />;
    case "contactLeadStatus":
      return <ContactLeadStatusBadge value={value} />;
    case "publishStatus":
      return <PublishStatusBadge value={value} />;
    case "role":
      return <RoleBadges row={row} property={column.property} />;
    case "roleName":
      return <Badge variant="green">{String(row.roleName ?? value ?? "NA")}</Badge>;
    case "roleId":
      return <span>{String(row.roleId ?? value ?? "NA")}</span>;
    case "name": {
      const firstName = String(row.firstName ?? "").trim();
      const lastName = String(row.lastName ?? "").trim();
      const fullName = `${firstName} ${lastName}`.trim();
      return <DefaultCell value={fullName || value} />;
    }
    case "rating":
      return <RatingStars value={value} />;
    case "date":
      return <DateCell value={value} />;
    case "time":
      return <TimeCell value={value} />;
    case "images":
      return <ImageCell value={value} />;
    case "color":
      return <ColorCell value={value} />;
    case "email":
    case "phoneNumber":
    case "text":
    case "title":
    case "tagName":
    case "categoryName":
    case "brandName":
    case "offerName":
    case "couponCode":
    case "attributeName":
    case "value":
    case "question":
    case "firstName":
    case "lastName":
    case "slug":
    case "description":
    case "type":
      return <DefaultCell value={value} />;
    case "discountType": {
      const discountType = String(value ?? row.type ?? "").trim();
      return discountType ? <span>{titleCase(discountType)}</span> : <span>NA</span>;
    }
    default:
      return <DefaultCell value={value} />;
  }
}

export function buildAdminTableColumns(
  columns: AdminTableColumnDefinition[]
): DataTableColumn<ModuleTableRow>[] {
  return columns
    .filter((column) => column.visible && column.datatype !== "button")
    .map((column) => ({
      key: column.property,
      header: column.label,
      cell: (row) => renderAdminCell(row, column),
    }));
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </svg>
  );
}
