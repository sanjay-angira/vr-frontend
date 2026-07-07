"use client";

import type { FormikProps } from "formik";
import { FieldArray, FormikProvider, getIn } from "formik";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import * as Yup from "yup";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import type { AdminFormProps } from "./types";
import { AdminFormLayout } from "./shared/AdminFormLayout";
import { FormDropdown } from "./shared/FormDropdown";
import { FormMultiDropdown } from "./shared/FormMultiDropdown";
import { FormStepper } from "./shared/FormStepper";
import {
  FormFullWidth,
  FormImageUpload,
  FormInput,
  FormTextarea,
  FormToggle,
} from "./shared/FormFields";
import { MultiImageUploadField, ImageUploadField } from "./shared/ImageUploadField";
import { UPLOAD_PATHS } from "./shared/uploadPaths";
import {
  fetchAttributesOptions,
  fetchBrandsOptions,
  fetchChildCategoriesOptions,
  fetchOffersOptions,
  fetchProductsOptions,
  fetchProductTagsOptions,
  fetchRootCategoriesOptions,
} from "./shared/fetchOptions";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { useSlugSync } from "./shared/useSlugSync";
import { buildVariantSlug } from "./shared/generateSlug";
import { activeField, htmlMinLength, requiredString, slugField } from "./shared/validation";
import {
  buildAttributeNameById,
  buildAttributeNameByIdFromRecord,
  buildProductPayload,
  COLOR_CUSTOMER_DISPLAY_OPTIONS,
  createEmptyVariantAttribute,
  emptyVariant,
  getVariantSlugPrefix,
  VARIANT_SLUG_PATTERN,
  hasColorAttribute,
  inferColorCustomerDisplay,
  isColorAttribute,
  isProductStepValid,
  mapAttributeIdsFromRecord,
  mapProductImagesFromRecord,
  mapVariantAttributesFromRecord,
  normalizeColorCode,
  normalizeIds,
  normalizeImageArray,
  PRODUCT_FORM_STEPS,
  productFormInitialValues,
  syncVariantAttributes,
  STEP_TOUCH_FIELDS,
  type AttributeViewOption,
  type ProductFormValues,
  type ProductVariant,
} from "./productForm.helpers";
import { FormQuillEditor } from "./shared/FormQuillEditor";

const variantSchema = Yup.object({
  name: requiredString("Variant name", 1),
  slug: Yup.string(),
  sku: Yup.string(),
  price: Yup.number().min(0.01, "Price must be at least 0.01").required("Price is required"),
  stock: Yup.number().min(0, "Stock must be 0 or more").required("Stock is required"),
  productVariantOffers: Yup.array().of(Yup.number()),
  images: Yup.array().of(Yup.string()),
  variantAttributes: Yup.array().of(
    Yup.object({
      attributeId: Yup.number().required(),
      value: Yup.string(),
      code: Yup.string(),
      image: Yup.string(),
      viewOption: Yup.string().oneOf(["value", "code", "image"]),
    })
  ),
});

const schema = Yup.object({
  productName: requiredString("Product name", 2),
  productSlug: slugField("Product slug"),
  shortDescription: requiredString("Short description", 2),
  description: htmlMinLength("Description", 2),
  productType: Yup.string().oneOf(["simple", "variable"]).required(),
  publishStatus: Yup.string().oneOf(["draft", "published", "scheduled"]).required(),
  brandId: Yup.string().required("Brand is required"),
  category: Yup.string(),
  childCategories: Yup.array().of(Yup.string()),
  isActive: activeField,
  productOffers: Yup.array().of(Yup.number()),
  productTags: Yup.array().of(Yup.number()),
  frequentlyBoughtTogether: Yup.array().of(Yup.number()),
  images: Yup.array().of(Yup.string()),
  attributeIds: Yup.array().of(Yup.number()),
  colorCustomerDisplay: Yup.string().oneOf(["value", "code", "image"]),
  variants: Yup.array()
    .of(variantSchema)
    .min(1, "At least one variant is required")
    .test(
      "variable-variant-slugs",
      "Each variant needs a valid slug",
      function (variants) {
        if (this.parent.productType !== "variable") return true;
        if (!Array.isArray(variants)) return false;
        return variants.every(
          (variant) =>
            typeof variant?.slug === "string" &&
            VARIANT_SLUG_PATTERN.test(variant.slug.trim())
        );
      }
    ),
  seo: Yup.object({
    metaTitle: requiredString("Meta title", 2),
    metaDescription: requiredString("Meta description", 2),
    metaKeywords: Yup.string(),
    canonicalUrl: Yup.string().url("Enter a valid URL").nullable().transform((v) => v || ""),
    ogImage: Yup.string(),
  }),
});

type ChildCategoryLevel = {
  options: Array<{ label: string; value: string | number }>;
};

function getNestedError(
  touched: Record<string, unknown>,
  errors: Record<string, unknown>,
  path: string
) {
  const isTouched = getIn(touched, path);
  const error = getIn(errors, path);
  return isTouched && error ? String(error) : undefined;
}

function VariantPanel({
  variant,
  index,
  expanded,
  onToggle,
  offers,
  isVariableProduct,
  productSlug,
  onRemove,
  formik,
  selectedAttributes,
  colorCustomerDisplay,
}: {
  variant: ProductVariant;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  offers: Array<{ label: string; value: string | number }>;
  isVariableProduct: boolean;
  productSlug: string;
  onRemove: () => void;
  formik: FormikProps<ProductFormValues>;
  selectedAttributes: Array<{ id: number; name: string }>;
  colorCustomerDisplay: AttributeViewOption;
}) {
  const prefix = `variants.${index}`;
  const slugManuallyEdited = useRef(Boolean(variant.id && variant.slug));

  useEffect(() => {
    if (slugManuallyEdited.current || !isVariableProduct) return;

    const nextSlug = variant.name.trim()
      ? buildVariantSlug(productSlug, variant.name)
      : getVariantSlugPrefix(productSlug);

    if (variant.slug !== nextSlug) {
      void formik.setFieldValue(`${prefix}.slug`, nextSlug, false);
    }
  }, [formik, isVariableProduct, prefix, productSlug, variant.name, variant.slug]);

  function handleVariantNameChange(value: string) {
    void formik.setFieldValue(`${prefix}.name`, value, false);

    if (!slugManuallyEdited.current && isVariableProduct) {
      const nextSlug = value.trim()
        ? buildVariantSlug(productSlug, value)
        : getVariantSlugPrefix(productSlug);
      void formik.setFieldValue(`${prefix}.slug`, nextSlug, false);
    }
  }

  function handleVariantSlugChange(value: string) {
    slugManuallyEdited.current = true;
    void formik.setFieldValue(`${prefix}.slug`, value, false);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-zinc-50"
      >
        <div>
          <p className="font-medium text-zinc-900">
            Variant #{index + 1}: {variant.name || "Untitled"}
          </p>
          <p className="mt-0.5 text-sm text-zinc-500">
            Price: ₹{variant.price || "0"} | Stock: {variant.stock || "0"}
          </p>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-zinc-100 px-5 py-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="Variant Name"
              required={isVariableProduct}
              name={`${prefix}.name`}
              value={variant.name}
              onChange={(event) => handleVariantNameChange(event.target.value)}
              onBlur={formik.handleBlur}
              error={getNestedError(formik.touched, formik.errors, `${prefix}.name`)}
              hint={
                isVariableProduct
                  ? "Required. Slug auto-fills from this name."
                  : "Optional for simple products. Defaults to product name."
              }
            />
            {isVariableProduct && (
              <Input
                label="Variant Slug"
                required
                name={`${prefix}.slug`}
                value={variant.slug}
                onChange={(event) => handleVariantSlugChange(event.target.value)}
                onBlur={formik.handleBlur}
                error={getNestedError(formik.touched, formik.errors, `${prefix}.slug`)}
                hint={`Starts with product slug: ${getVariantSlugPrefix(productSlug) || "{product-slug}-"}`}
              />
            )}
            <Input
              label="SKU"
              name={`${prefix}.sku`}
              value={variant.sku}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={getNestedError(formik.touched, formik.errors, `${prefix}.sku`)}
            />
            <Input
              label="Price"
              required
              name={`${prefix}.price`}
              type="number"
              step="0.01"
              min="0"
              value={variant.price}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={getNestedError(formik.touched, formik.errors, `${prefix}.price`)}
            />
            <Input
              label="Stock"
              required
              name={`${prefix}.stock`}
              type="number"
              min="0"
              value={variant.stock}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={getNestedError(formik.touched, formik.errors, `${prefix}.stock`)}
            />

            <div className="md:col-span-2">
              <FormMultiDropdown
                label="Variant Offers"
                value={variant.productVariantOffers}
                onChange={(values) => formik.setFieldValue(`${prefix}.productVariantOffers`, values)}
                options={offers}
                hint={`Total offers: ${offers.length}`}
              />
            </div>

            {isVariableProduct && (
              <MultiImageUploadField
                label="Variant Images"
                values={variant.images}
                onChange={(urls) => formik.setFieldValue(`${prefix}.images`, urls)}
                uploadPath={UPLOAD_PATHS.variantImages}
              />
            )}

            {selectedAttributes.length > 0 && (
              <div className="md:col-span-2 space-y-3 rounded-lg border border-zinc-100 bg-zinc-50 p-4">
                <div>
                  <h4 className="text-sm font-medium text-zinc-900">Attribute Values</h4>
                  <p className="mt-1 text-xs text-zinc-500">
                    Enter a value for each attribute. Color Name is always required.
                    {colorCustomerDisplay === "code" &&
                      " Also enter the color code for each variant."}
                    {colorCustomerDisplay === "image" &&
                      " Also upload the color image for each variant."}
                    {colorCustomerDisplay === "value" &&
                      " Customer display is set to color name only on the Product Information step."}
                  </p>
                </div>
                <div className="space-y-4">
                  {selectedAttributes.map((attribute) => {
                    const attributeIndex = variant.variantAttributes.findIndex(
                      (item) => item.attributeId === attribute.id
                    );
                    const basePath = `${prefix}.variantAttributes.${attributeIndex}`;
                    const attributeValue =
                      attributeIndex >= 0
                        ? variant.variantAttributes[attributeIndex]
                        : undefined;
                    const isColor = isColorAttribute(attribute.name);

                    if (!isColor) {
                      return (
                        <Input
                          key={attribute.id}
                          label={attribute.name}
                          required
                          name={`${basePath}.value`}
                          value={attributeValue?.value ?? ""}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder={`Enter ${attribute.name}`}
                          error={getNestedError(
                            formik.touched,
                            formik.errors,
                            `${basePath}.value`
                          )}
                        />
                      );
                    }

                    return (
                      <div key={attribute.id}>
                        <div
                          className={`grid grid-cols-1 gap-4 ${colorCustomerDisplay === "value"
                              ? "md:grid-cols-1"
                              : "md:grid-cols-2"
                            }`}
                        >
                          <Input
                            label="Color Name"
                            required
                            name={`${basePath}.value`}
                            value={attributeValue?.value ?? ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="e.g. Saffron Red"
                            error={getNestedError(
                              formik.touched,
                              formik.errors,
                              `${basePath}.value`
                            )}
                          />
                          {colorCustomerDisplay === "code" && (
                            <Input
                              label="Color Code"
                              required
                              type="color"
                              name={`${basePath}.code`}
                              value={normalizeColorCode(attributeValue?.code)}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={getNestedError(
                                formik.touched,
                                formik.errors,
                                `${basePath}.code`
                              )}
                            />
                          )}
                          {colorCustomerDisplay === "image" && (
                            <ImageUploadField
                              label="Color Image"
                              required
                              variant="compact"
                              value={attributeValue?.image ?? ""}
                              onChange={(url) =>
                                formik.setFieldValue(`${basePath}.image`, url)
                              }
                              uploadPath={UPLOAD_PATHS.attributeColors}
                              error={getNestedError(
                                formik.touched,
                                formik.errors,
                                `${basePath}.image`
                              )}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end md:col-span-2">
              {isVariableProduct && (
                <Button type="button" variant="secondary" onClick={onRemove}>
                  <Trash2 className="h-4 w-4" />
                  Remove Variant
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductForm({ module, recordId }: AdminFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedVariant, setExpandedVariant] = useState<number | null>(0);

  const [brands, setBrands] = useState<Array<{ label: string; value: string | number }>>([]);
  const [rootCategories, setRootCategories] = useState<
    Array<{ label: string; value: string | number }>
  >([]);
  const [childCategoryLevels, setChildCategoryLevels] = useState<ChildCategoryLevel[]>([]);
  const [offers, setOffers] = useState<Array<{ label: string; value: string | number }>>([]);
  const [tags, setTags] = useState<Array<{ label: string; value: string | number }>>([]);
  const [products, setProducts] = useState<Array<{ label: string; value: string | number }>>([]);
  const [attributes, setAttributes] = useState<Array<{ label: string; value: string | number }>>([]);

  useEffect(() => {
    fetchBrandsOptions().then(setBrands);
    fetchRootCategoriesOptions().then(setRootCategories);
    fetchOffersOptions().then(setOffers);
    fetchProductTagsOptions().then(setTags);
    fetchProductsOptions().then(setProducts);
    fetchAttributesOptions().then(setAttributes);
  }, []);

  const { formik, loading, loadError, isEdit } = useAdminCrudForm<ProductFormValues>({
    module,
    recordId,
    initialValues: productFormInitialValues,
    validationSchema: schema,
    mapRecordToValues: (record) => {
      const seo = (record.seo ?? {}) as Record<string, unknown>;
      const productType = String(record.productType ?? "simple").toLowerCase() as
        | "simple"
        | "variable";

      const variants = Array.isArray(record.variants)
        ? (record.variants as Record<string, unknown>[]).map((variant) => ({
          id: variant.id ? Number(variant.id) : undefined,
          name: String(variant.name ?? ""),
          slug: String(variant.slug ?? ""),
          sku: String(variant.sku ?? ""),
          price: variant.price != null ? Number(variant.price) : ("" as const),
          stock: variant.stock != null ? Number(variant.stock) : (1 as const),
          productVariantOffers: normalizeIds(variant.productVariantOffers ?? variant.productOffers),
          images: normalizeImageArray(
            variant.images ?? variant.variantImages ?? variant.image
          ),
          variantAttributes: mapVariantAttributesFromRecord(variant),
        }))
        : [emptyVariant()];

      const attributeIds = mapAttributeIdsFromRecord(record);
      const attributeNameById = buildAttributeNameByIdFromRecord(
        record,
        variants.length > 0 ? variants : [emptyVariant()]
      );
      const colorCustomerDisplay = inferColorCustomerDisplay(
        variants.length > 0 ? variants : [emptyVariant()],
        attributeNameById
      );
      const syncedVariants = syncVariantAttributes(
        variants.length > 0 ? variants : [emptyVariant()],
        attributeIds,
        attributeNameById
      );

      return {
        productName: String(record.productName ?? ""),
        productSlug: String(record.productSlug ?? ""),
        shortDescription: String(record.shortDescription ?? ""),
        description: String(record.description ?? ""),
        productType,
        publishStatus: String(record.publishStatus ?? "draft"),
        brandId: String(record.brandId ?? (record.brand as { id?: number })?.id ?? ""),
        category: String((record.category as { id?: number })?.id ?? record.category ?? ""),
        childCategories: [],
        isActive: Boolean(record.isActive ?? true),
        productOffers: normalizeIds(record.productOffers),
        productTags: normalizeIds(record.productTags ?? record.tags),
        frequentlyBoughtTogether: normalizeIds(record.frequentlyBoughtTogether),
        images: mapProductImagesFromRecord(record, productType, syncedVariants),
        attributeIds,
        colorCustomerDisplay,
        variants: syncedVariants,
        seo: {
          metaTitle: String(seo.metaTitle ?? record.metaTitle ?? ""),
          metaDescription: String(seo.metaDescription ?? record.metaDescription ?? ""),
          metaKeywords: String(seo.metaKeywords ?? record.metaKeywords ?? ""),
          canonicalUrl: String(seo.canonicalUrl ?? ""),
          ogImage: String(seo.ogImage ?? ""),
        },
      };
    },
    mapValuesToPayload: (values) =>
      buildProductPayload(values, buildAttributeNameById(values.attributeIds, attributes)),
  });

  useSlugSync(formik, "productName", "productSlug", !isEdit);

  async function loadChildLevelsFromParent(parentId: string, resetFromLevel = 0) {
    if (!parentId) {
      setChildCategoryLevels([]);
      formik.setFieldValue("childCategories", []);
      return;
    }

    const options = await fetchChildCategoriesOptions(parentId);
    setChildCategoryLevels((prev) => {
      const next = prev.slice(0, resetFromLevel);
      if (options.length > 0) {
        next.push({ options });
      }
      return next;
    });

    formik.setFieldValue(
      "childCategories",
      formik.values.childCategories.slice(0, resetFromLevel)
    );
  }

  async function handleCategoryChange(value: string) {
    formik.setFieldValue("category", value);
    formik.setFieldValue("childCategories", []);
    setChildCategoryLevels([]);
    if (value) {
      await loadChildLevelsFromParent(value, 0);
    }
  }

  async function handleChildCategoryChange(levelIndex: number, value: string) {
    const nextChildCategories = [...formik.values.childCategories];
    nextChildCategories[levelIndex] = value;
    nextChildCategories.length = levelIndex + 1;
    formik.setFieldValue("childCategories", nextChildCategories);

    setChildCategoryLevels((prev) => prev.slice(0, levelIndex + 1));

    if (value) {
      const options = await fetchChildCategoriesOptions(value);
      if (options.length > 0) {
        setChildCategoryLevels((prev) => {
          const next = prev.slice(0, levelIndex + 1);
          next.push({ options });
          return next;
        });
      }
    }
  }

  async function touchStepFields(step: number) {
    const fields = STEP_TOUCH_FIELDS[step] ?? [];
    for (const field of fields) {
      await formik.setFieldTouched(field, true, false);
    }
    if (step === 2) {
      const attributeNameById = buildAttributeNameById(
        formik.values.attributeIds,
        attributes
      );

      formik.values.variants.forEach((variant, index) => {
        formik.setFieldTouched(`variants.${index}.name`, true, false);
        formik.setFieldTouched(`variants.${index}.slug`, true, false);
        formik.setFieldTouched(`variants.${index}.price`, true, false);
        formik.setFieldTouched(`variants.${index}.stock`, true, false);
        variant.variantAttributes.forEach((item, attributeIndex) => {
          formik.setFieldTouched(
            `variants.${index}.variantAttributes.${attributeIndex}.value`,
            true,
            false
          );
          if (isColorAttribute(attributeNameById[item.attributeId] ?? "")) {
            if (formik.values.colorCustomerDisplay === "code") {
              formik.setFieldTouched(
                `variants.${index}.variantAttributes.${attributeIndex}.code`,
                true,
                false
              );
            }
            if (formik.values.colorCustomerDisplay === "image") {
              formik.setFieldTouched(
                `variants.${index}.variantAttributes.${attributeIndex}.image`,
                true,
                false
              );
            }
          }
        });
      });
    }
  }

  async function handleNextStep(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    await touchStepFields(currentStep);
    const errors = await formik.validateForm();
    const namesById = buildAttributeNameById(formik.values.attributeIds, attributes);

    if (!isProductStepValid(currentStep, formik.values, errors, namesById)) {
      return;
    }

    if (currentStep === 1 && formik.values.productType === "variable") {
      const slugPrefix = getVariantSlugPrefix(formik.values.productSlug);
      formik.values.variants.forEach((variant, index) => {
        if (!variant.slug.trim()) {
          void formik.setFieldValue(`variants.${index}.slug`, slugPrefix, false);
        }
      });
    }

    // Defer step change so the same click cannot land on the submit button
    // when Next is replaced after advancing to the final step.
    window.setTimeout(() => {
      setCurrentStep((step) => Math.min(step + 1, PRODUCT_FORM_STEPS.length));
    }, 0);
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (currentStep !== PRODUCT_FORM_STEPS.length) {
      return;
    }

    void formik.handleSubmit(event);
  }

  function handlePreviousStep() {
    setCurrentStep((step) => Math.max(step - 1, 1));
  }

  const isSimpleProduct = formik.values.productType === "simple";
  const isVariableProduct = formik.values.productType === "variable";
  const selectedAttributes = formik.values.attributeIds
    .map((attributeId) => {
      const option = attributes.find((item) => Number(item.value) === attributeId);
      return option
        ? { id: attributeId, name: option.label }
        : null;
    })
    .filter((item): item is { id: number; name: string } => item !== null);
  const attributeNameById = buildAttributeNameById(formik.values.attributeIds, attributes);
  const showColorDisplaySettings = hasColorAttribute(
    formik.values.attributeIds,
    attributeNameById
  );
  const selectedColorDisplayOption = COLOR_CUSTOMER_DISPLAY_OPTIONS.find(
    (option) => option.value === formik.values.colorCustomerDisplay
  );
  const stepValid = isProductStepValid(
    currentStep,
    formik.values,
    formik.errors,
    attributeNameById
  );

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Product" : "Add Product"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <FormikProvider value={formik}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <FormStepper
            steps={[...PRODUCT_FORM_STEPS]}
            currentStep={currentStep}
            onStepClick={(step) => {
              if (step < currentStep) setCurrentStep(step);
            }}
          />

          {currentStep === 1 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormInput formik={formik} name="productName" label="Product Name" required />
              <FormInput formik={formik} name="productSlug" label="Product Slug" required />

              <FormFullWidth>
                <FormInput
                  formik={formik}
                  name="shortDescription"
                  label="Short Description"
                  required
                />
              </FormFullWidth>

              <FormFullWidth>
                <FormQuillEditor
                  label="Description"
                  required
                  value={formik.values.description}
                  onChange={(content) => formik.setFieldValue("description", content)}
                  onBlur={() => formik.setFieldTouched("description", true)}
                  error={getNestedError(formik.touched, formik.errors, "description")}
                />
              </FormFullWidth>

              <FormFullWidth>
                <FormMultiDropdown
                  label="Apply Offers"
                  value={formik.values.productOffers}
                  onChange={(values) => formik.setFieldValue("productOffers", values)}
                  onBlur={() => formik.setFieldTouched("productOffers", true)}
                  options={offers}
                />
              </FormFullWidth>

              <FormDropdown
                label="Product Type"
                required
                value={formik.values.productType}
                onChange={(value) => {
                  formik.setFieldValue("productType", value);
                  if (value === "simple" && formik.values.variants.length === 0) {
                    formik.setFieldValue("variants", [emptyVariant(formik.values.productSlug)]);
                  }
                }}
                onBlur={() => formik.setFieldTouched("productType", true)}
                error={getNestedError(formik.touched, formik.errors, "productType")}
                options={[
                  { label: "Simple", value: "simple" },
                  { label: "Variable", value: "variable" },
                ]}
              />

              <FormDropdown
                label="Publish Status"
                required
                value={formik.values.publishStatus}
                onChange={(value) => formik.setFieldValue("publishStatus", value)}
                onBlur={() => formik.setFieldTouched("publishStatus", true)}
                error={getNestedError(formik.touched, formik.errors, "publishStatus")}
                options={[
                  { label: "Draft", value: "draft" },
                  { label: "Published", value: "published" },
                  { label: "Scheduled", value: "scheduled" },
                ]}
              />

              <FormDropdown
                label="Brand"
                required
                value={formik.values.brandId}
                onChange={(value) => formik.setFieldValue("brandId", value)}
                onBlur={() => formik.setFieldTouched("brandId", true)}
                error={getNestedError(formik.touched, formik.errors, "brandId")}
                options={brands}
                placeholder="Select a brand"
              />

              <FormDropdown
                label="Category"
                required
                value={formik.values.category}
                onChange={handleCategoryChange}
                onBlur={() => formik.setFieldTouched("category", true)}
                error={getNestedError(formik.touched, formik.errors, "category")}
                options={rootCategories}
                placeholder="Select a category"
              />

              {childCategoryLevels.map((level, index) =>
                level.options.length > 0 ? (
                  <FormDropdown
                    key={`child-category-${index}`}
                    label={`Select Child Category Level ${index + 1}`}
                    value={formik.values.childCategories[index] ?? ""}
                    onChange={(value) => handleChildCategoryChange(index, value)}
                    options={level.options}
                    placeholder="Select a child category"
                  />
                ) : null
              )}

              <FormFullWidth>
                <FormMultiDropdown
                  label="Frequently Bought Together"
                  value={formik.values.frequentlyBoughtTogether}
                  onChange={(values) => formik.setFieldValue("frequentlyBoughtTogether", values)}
                  options={products}
                />
              </FormFullWidth>

              <FormFullWidth>
                <FormMultiDropdown
                  label="Product Tags"
                  value={formik.values.productTags}
                  onChange={(values) => formik.setFieldValue("productTags", values)}
                  options={tags}
                />
              </FormFullWidth>

              <FormFullWidth>
                <div
                  className={`grid grid-cols-1 gap-5 ${
                    showColorDisplaySettings ? "md:grid-cols-2" : ""
                  }`}
                >
                  <FormMultiDropdown
                    label="Product Attributes"
                    value={formik.values.attributeIds}
                    onChange={(values) => {
                      const nextAttributeNameById = buildAttributeNameById(values, attributes);
                      const includesColor = hasColorAttribute(values, nextAttributeNameById);

                      formik.setFieldValue("attributeIds", values);
                      formik.setFieldValue(
                        "variants",
                        syncVariantAttributes(
                          formik.values.variants,
                          values,
                          nextAttributeNameById
                        )
                      );

                      if (!includesColor) {
                        formik.setFieldValue("colorCustomerDisplay", "value");
                      }
                    }}
                    onBlur={() => formik.setFieldTouched("attributeIds", true)}
                    options={attributes}
                    placeholder="Select attributes for this product"
                  />
                  {showColorDisplaySettings && (
                    <FormDropdown
                      label="Display on customer side"
                      required
                      value={formik.values.colorCustomerDisplay}
                      onChange={(value) =>
                        formik.setFieldValue(
                          "colorCustomerDisplay",
                          value as AttributeViewOption
                        )
                      }
                      onBlur={() => formik.setFieldTouched("colorCustomerDisplay", true)}
                      options={COLOR_CUSTOMER_DISPLAY_OPTIONS.map((option) => ({
                        label: option.label,
                        value: option.value,
                      }))}
                      placeholder="Select color display"
                      error={getNestedError(
                        formik.touched,
                        formik.errors,
                        "colorCustomerDisplay"
                      )}
                    />
                  )}
                </div>
              </FormFullWidth>


              {isSimpleProduct && (
                <MultiImageUploadField
                  label="Product Images"
                  values={formik.values.images}
                  onChange={(urls) => formik.setFieldValue("images", urls)}
                  uploadPath={UPLOAD_PATHS.products}
                />
              )}

              <FormFullWidth>
                <FormToggle formik={formik} name="isActive" label="Active Status" />
              </FormFullWidth>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Variations</h3>
                <div className="mt-3 border-t border-zinc-200" />
              </div>

              <FieldArray name="variants">
                {({ push, remove }) => (
                  <>
                    {formik.values.variants.length > 0 ? (
                      <div className="space-y-4">
                        {formik.values.variants.map((variant, index) => (
                          <VariantPanel
                            key={index}
                            variant={variant}
                            index={index}
                            expanded={expandedVariant === index}
                            onToggle={() =>
                              setExpandedVariant((current) => (current === index ? null : index))
                            }
                            offers={offers}
                            isVariableProduct={isVariableProduct}
                            productSlug={formik.values.productSlug}
                            onRemove={() => remove(index)}
                            formik={formik}
                            selectedAttributes={selectedAttributes}
                            colorCustomerDisplay={formik.values.colorCustomerDisplay}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border-2 border-dashed border-zinc-200 py-10 text-center">
                        <h4 className="text-lg font-semibold text-zinc-500">No Variants Added</h4>
                        <p className="mt-2 text-sm text-zinc-400">
                          Create different versions of your product (e.g., size, color)
                        </p>
                      </div>
                    )}

                    {isVariableProduct && (
                      <div className="border-t border-zinc-200 pt-5 text-center">
                        <Button
                          type="button"
                          onClick={() => {
                            push({
                              ...emptyVariant(formik.values.productSlug),
                              variantAttributes: formik.values.attributeIds.map((attributeId) =>
                                createEmptyVariantAttribute(
                                  attributeId,
                                  attributeNameById[attributeId]
                                )
                              ),
                            });
                            setExpandedVariant(formik.values.variants.length);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Add Variant
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </FieldArray>
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormFullWidth>
                <FormInput formik={formik} name="seo.metaTitle" label="Meta Title" required />
              </FormFullWidth>
              <FormFullWidth>
                <FormTextarea
                  formik={formik}
                  name="seo.metaDescription"
                  label="Meta Description"
                  required
                  rows={3}
                />
              </FormFullWidth>
              <FormInput
                formik={formik}
                name="seo.metaKeywords"
                label="Meta Keywords"
                hint="Separate keywords with commas"
              />
              <FormInput formik={formik} name="seo.canonicalUrl" label="Canonical URL" type="url" />
              <FormImageUpload
                formik={formik}
                name="seo.ogImage"
                label="OG Image"
                uploadPath={UPLOAD_PATHS.products}
              />
            </div>
          )}

          <div
            className={`flex pt-6 ${currentStep === 1 ? "justify-end" : "justify-between"}`}
          >
            {currentStep > 1 && (
              <Button type="button" variant="secondary" onClick={handlePreviousStep}>
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={!stepValid}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!stepValid || formik.isSubmitting}
              >
                {formik.isSubmitting
                  ? isEdit
                    ? "Updating Product..."
                    : "Creating Product..."
                  : isEdit
                    ? "Update Product"
                    : "Create Product"}
              </Button>
            )}
          </div>
        </form>
      </FormikProvider>
    </AdminFormLayout>
  );
}
