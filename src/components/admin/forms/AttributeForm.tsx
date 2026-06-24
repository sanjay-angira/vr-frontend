"use client";

import { FieldArray, FormikProvider } from "formik";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import type { AdminFormProps } from "./types";
import { AdminFormLayout } from "./shared/AdminFormLayout";
import {
  FormActions,
  FormFullWidth,
  FormImageUpload,
  FormInput,
  FormSection,
  FormSelect,
  FormToggle,
} from "./shared/FormFields";
import { Button } from "@/components/common/Button";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { UPLOAD_PATHS } from "./shared/uploadPaths";
import { hexColor, requiredString } from "./shared/validation";

type OptionRow = { id?: number | null; value: string; code: string; image: string };

type Values = {
  name: string;
  type: string;
  isFilterable: boolean;
  isRequired: boolean;
  options: OptionRow[];
};

const initialValues: Values = {
  name: "",
  type: "select",
  isFilterable: true,
  isRequired: false,
  options: [{ value: "", code: "#000000", image: "" }],
};

const schema = Yup.object({
  name: requiredString("Name", 2, 100),
  type: Yup.string().oneOf(["text", "number", "boolean", "select"]).required(),
  isFilterable: Yup.boolean(),
  isRequired: Yup.boolean(),
  options: Yup.array().when("type", {
    is: "select",
    then: (s) =>
      s.of(
        Yup.object({
          value: requiredString("Option value", 1, 255),
          code: hexColor,
          image: Yup.string(),
        })
      ),
    otherwise: (s) => s,
  }),
});

export function AttributeForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const { formik, loading, loadError, isEdit } = useAdminCrudForm<Values>({
    module,
    recordId,
    initialValues,
    validationSchema: schema,
    mapRecordToValues: (r) => ({
      name: String(r.name ?? ""),
      type: String(r.type ?? "select"),
      isFilterable: Boolean(r.isFilterable ?? true),
      isRequired: Boolean(r.isRequired ?? false),
      options:
        Array.isArray(r.options) && r.options.length > 0
          ? (r.options as OptionRow[]).map((o) => ({
              id: o.id ?? null,
              value: String(o.value ?? ""),
              code: String(o.code ?? "#000000"),
              image: String(o.image ?? ""),
            }))
          : [{ value: "", code: "#000000", image: "" }],
    }),
    mapValuesToPayload: (v) => ({
      name: v.name.trim(),
      type: v.type,
      isFilterable: v.isFilterable,
      isRequired: v.isRequired,
      options:
        v.type === "select"
          ? v.options
              .map((o) => ({
                ...(o.id ? { id: o.id } : {}),
                value: o.value.trim(),
                code: o.code || null,
                image: o.image.trim() || null,
              }))
              .filter((o) => o.value)
          : [],
    }),
  });

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Attribute" : "Add Attribute"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          <FormSection title="Attribute details">
            <FormInput formik={formik} name="name" label="Name" required />
            <FormSelect
              formik={formik}
              name="type"
              label="Type"
              required
              options={[
                { label: "Text", value: "text" },
                { label: "Number", value: "number" },
                { label: "Boolean", value: "boolean" },
                { label: "Select", value: "select" },
              ]}
            />
            <FormToggle formik={formik} name="isFilterable" label="Filterable" />
            <FormToggle formik={formik} name="isRequired" label="Required" />
          </FormSection>

          {formik.values.type === "select" && (
            <FieldArray name="options">
              {({ push, remove }) => (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-zinc-900">Attribute Options</h2>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => push({ value: "", code: "#000000", image: "" })}
                    >
                      <Plus className="h-4 w-4" />
                      Add Option
                    </Button>
                  </div>
                  {formik.values.options.map((_, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-4 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 md:grid-cols-4"
                    >
                      <FormInput formik={formik} name={`options.${index}.value`} label="Value" required />
                      <FormInput formik={formik} name={`options.${index}.code`} label="Color Code" />
                      <FormImageUpload
                        formik={formik}
                        name={`options.${index}.image`}
                        label="Image"
                        uploadPath={UPLOAD_PATHS.attributeOptions}
                      />
                      <div className="flex items-end justify-end">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={formik.values.options.length <= 1}
                          className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Remove option"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </FieldArray>
          )}

          <FormActions
            isEdit={isEdit}
            isSubmitting={formik.isSubmitting}
            entityLabel="Attribute"
            onCancel={() => router.push(`/admin/${module}`)}
          />
        </form>
      </FormikProvider>
    </AdminFormLayout>
  );
}
