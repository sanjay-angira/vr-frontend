/** Column definitions mirrored from vr-admin/static-data/static-common-table-columns.ts */

export type AdminTableColumnDefinition = {
  label: string;
  property: string;
  type: string;
  datatype: string;
  visible: boolean;
  cssClasses?: string[];
};

export const UserComponentColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "Name", property: "name", type: "text", datatype: "name", visible: true, cssClasses: ["font-medium"] },
  { label: "Email", property: "email", type: "text", datatype: "email", visible: true, cssClasses: ["font-medium"] },
  { label: "Phone Number", property: "phoneNumber", type: "text", datatype: "phoneNumber", visible: true, cssClasses: ["font-medium"] },
  { label: "Roles", property: "role", type: "text", datatype: "role", visible: true, cssClasses: ["font-medium"] },
  { label: "Status", property: "isActive", type: "text", datatype: "status", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Updated On", property: "updatedAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true },
];

export const ProductComponentColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "Product Name", property: "productName", type: "text", datatype: "productName", visible: true, cssClasses: ["font-medium"] },
  { label: "Category", property: "categoryName", type: "text", datatype: "categoryName", visible: true, cssClasses: ["font-medium"] },
  { label: "Brand", property: "brandName", type: "text", datatype: "brandName", visible: true, cssClasses: ["font-medium"] },
  { label: "Status", property: "isActive", type: "text", datatype: "status", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Updated On", property: "updatedAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true },
];

export const CategoryComponentColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "Category Name", property: "categoryName", type: "text", datatype: "categoryName", visible: true },
  { label: "Image", property: "image", type: "text", datatype: "images", visible: true, cssClasses: ["font-medium"] },
  { label: "Mobile Image", property: "mobileImage", type: "text", datatype: "images", visible: true, cssClasses: ["font-medium"] },
  { label: "Parent Category", property: "parentCategory", type: "text", datatype: "parentCategory", visible: true },
  { label: "Status", property: "isActive", type: "text", datatype: "status", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Updated On", property: "updatedAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true },
];

export const OffersAndDealsColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "Offer Name", property: "offerName", type: "text", datatype: "offerName", visible: true, cssClasses: ["font-medium"] },
  { label: "Discount Type", property: "discountType", type: "text", datatype: "discountType", visible: true, cssClasses: ["font-medium"] },
  { label: "Discount Value", property: "discountValue", type: "text", datatype: "discountValue", visible: true, cssClasses: ["font-medium"] },
  { label: "Start Date", property: "startDate", type: "text", datatype: "time", visible: true, cssClasses: ["font-medium"] },
  { label: "End Date", property: "endDate", type: "text", datatype: "time", visible: true, cssClasses: ["font-medium"] },
  { label: "Time Based", property: "timeBased", type: "text", datatype: "on-off", visible: true, cssClasses: ["font-medium"] },
  { label: "Status", property: "isActive", type: "text", datatype: "status", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Updated On", property: "updatedAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true },
];

export const ContactUsLeadsColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "First Name", property: "firstName", type: "text", datatype: "firstName", visible: true, cssClasses: ["font-medium"] },
  { label: "Last Name", property: "lastName", type: "text", datatype: "lastName", visible: true, cssClasses: ["font-medium"] },
  { label: "Email", property: "email", type: "text", datatype: "email", visible: true, cssClasses: ["font-medium"] },
  { label: "Phone Number", property: "phoneNumber", type: "text", datatype: "phoneNumber", visible: true, cssClasses: ["font-medium"] },
  { label: "Status", property: "status", type: "text", datatype: "contactLeadStatus", visible: true, cssClasses: ["font-medium"] },
  { label: "Email Verified", property: "emailVerified", type: "text", datatype: "on-off", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Updated On", property: "updatedAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true },
];

export const BrandComponentColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "Brand Name", property: "brandName", type: "text", datatype: "brandName", visible: true, cssClasses: ["font-medium"] },
  { label: "Status", property: "isActive", type: "text", datatype: "status", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Updated On", property: "updatedAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true },
];

export const CmsPagesComponentColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "Title", property: "title", type: "text", datatype: "title", visible: true, cssClasses: ["font-medium"] },
  { label: "Slug", property: "slug", type: "text", datatype: "slug", visible: true, cssClasses: ["font-medium"] },
  { label: "Status", property: "isActive", type: "text", datatype: "status", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Updated On", property: "updatedAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true },
];

export const ProductFaqComponentColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "Question", property: "question", type: "text", datatype: "question", visible: true, cssClasses: ["font-medium"] },
  { label: "Product Name", property: "productName", type: "text", datatype: "productName", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Updated On", property: "updatedAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Status", property: "isActive", type: "text", datatype: "status", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true },
];

export const CouponComponentColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "Coupon Code", property: "couponCode", type: "text", datatype: "couponCode", visible: true, cssClasses: ["font-medium"] },
  { label: "Discount Type", property: "discountType", type: "text", datatype: "discountType", visible: true, cssClasses: ["font-medium"] },
  { label: "Discount Value", property: "discountValue", type: "text", datatype: "discountValue", visible: true, cssClasses: ["font-medium"] },
  { label: "Start Date", property: "startDate", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "End Date", property: "endDate", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "User Specific", property: "isUserSpecific", type: "text", datatype: "on-off", visible: true, cssClasses: ["font-medium"] },
  { label: "Status", property: "isActive", type: "text", datatype: "status", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Updated On", property: "updatedAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true },
];

export const ReviewsComponentColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "Product Name", property: "productName", type: "text", datatype: "productName", visible: true, cssClasses: ["font-medium"] },
  { label: "Rating", property: "rating", type: "text", datatype: "rating", visible: true, cssClasses: ["font-medium"] },
  { label: "User Name", property: "userName", type: "text", datatype: "text", visible: true, cssClasses: ["font-medium"] },
  { label: "Approved", property: "isApproved", type: "text", datatype: "status", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Updated On", property: "updatedAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true },
];

export const BlogComponentColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "Title", property: "title", type: "text", datatype: "title", visible: true, cssClasses: ["font-medium"] },
  { label: "Slug", property: "slug", type: "text", datatype: "slug", visible: false, cssClasses: ["font-medium"] },
  { label: "Category", property: "categoryName", type: "text", datatype: "categoryName", visible: true, cssClasses: ["font-medium"] },
  { label: "Publish Status", property: "publishStatus", type: "text", datatype: "publishStatus", visible: true, cssClasses: ["font-medium"] },
  { label: "Status", property: "isActive", type: "text", datatype: "status", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Updated On", property: "updatedAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true },
];

export const BlogCategoryComponentColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "Title", property: "title", type: "text", datatype: "title", visible: true, cssClasses: ["font-medium"] },
  { label: "Slug", property: "slug", type: "text", datatype: "slug", visible: false, cssClasses: ["font-medium"] },
  { label: "Description", property: "description", type: "text", datatype: "description", visible: false, cssClasses: ["font-medium"] },
  { label: "Status", property: "isActive", type: "text", datatype: "status", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Updated On", property: "updatedAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true, cssClasses: ["font-medium"] },
];

export const BlogTagComponentColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "Title", property: "title", type: "text", datatype: "title", visible: true, cssClasses: ["font-medium"] },
  { label: "Slug", property: "slug", type: "text", datatype: "slug", visible: false, cssClasses: ["font-medium"] },
  { label: "Description", property: "description", type: "text", datatype: "description", visible: false, cssClasses: ["font-medium"] },
  { label: "Status", property: "isActive", type: "text", datatype: "status", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Updated On", property: "updatedAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true, cssClasses: ["font-medium"] },
];

export const ProductTagComponentColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "Tag Name", property: "tagName", type: "text", datatype: "tagName", visible: true, cssClasses: ["font-medium"] },
  { label: "Status", property: "isActive", type: "text", datatype: "status", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Updated On", property: "updatedAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true, cssClasses: ["font-medium"] },
];

export const RolesComponentColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "Role Name", property: "roleName", type: "text", datatype: "roleName", visible: true, cssClasses: ["font-medium"] },
  { label: "Role Id", property: "roleId", type: "text", datatype: "roleId", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "time", visible: true, cssClasses: ["font-medium"] },
  { label: "Updated On", property: "updatedAt", type: "text", datatype: "time", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true, cssClasses: ["font-medium"] },
];

export const AttributeComponentColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "Name", property: "name", type: "text", datatype: "name", visible: true, cssClasses: ["font-medium"] },
  { label: "Filterable", property: "isFilterable", type: "text", datatype: "on-off", visible: true, cssClasses: ["font-medium"] },
  { label: "Required", property: "isRequired", type: "text", datatype: "on-off", visible: true, cssClasses: ["font-medium"] },
  { label: "Image / Swatch", property: "supportsImage", type: "text", datatype: "on-off", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Updated On", property: "updatedAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true, cssClasses: ["font-medium"] },
];

export const BannerComponentColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "Title", property: "title", type: "text", datatype: "title", visible: true, cssClasses: ["font-medium"] },
  { label: "Subtitle", property: "subtitle", type: "text", datatype: "text", visible: true, cssClasses: ["font-medium"] },
  { label: "Desktop Image", property: "image", type: "text", datatype: "images", visible: true, cssClasses: ["font-medium"] },
  { label: "Mobile Image", property: "mobileImage", type: "text", datatype: "images", visible: true, cssClasses: ["font-medium"] },
  { label: "Position", property: "position", type: "text", datatype: "text", visible: true, cssClasses: ["font-medium"] },
  { label: "Status", property: "status", type: "text", datatype: "status", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Updated On", property: "updatedAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true, cssClasses: ["font-medium"] },
];

export const OrdersComponentColumns: AdminTableColumnDefinition[] = [
  { label: "ID", property: "id", type: "text", datatype: "id", visible: true, cssClasses: ["font-medium"] },
  { label: "Order #", property: "orderNumber", type: "text", datatype: "text", visible: true, cssClasses: ["font-medium"] },
  { label: "Customer", property: "customerName", type: "text", datatype: "name", visible: true, cssClasses: ["font-medium"] },
  { label: "Phone", property: "phone", type: "text", datatype: "phoneNumber", visible: true, cssClasses: ["font-medium"] },
  { label: "Items", property: "itemCount", type: "text", datatype: "text", visible: true, cssClasses: ["font-medium"] },
  { label: "Total", property: "total", type: "text", datatype: "text", visible: true, cssClasses: ["font-medium"] },
  { label: "Payment", property: "paymentMethod", type: "text", datatype: "text", visible: true, cssClasses: ["font-medium"] },
  { label: "Payment Status", property: "paymentStatus", type: "text", datatype: "text", visible: true, cssClasses: ["font-medium"] },
  { label: "Order Status", property: "orderStatus", type: "text", datatype: "text", visible: true, cssClasses: ["font-medium"] },
  { label: "Created On", property: "createdAt", type: "text", datatype: "date", visible: true, cssClasses: ["font-medium"] },
  { label: "Actions", property: "actions", type: "button", datatype: "button", visible: true },
];
