"use client";

import type { FormikProps } from "formik";
import { getIn } from "formik";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { FormDropdown } from "./FormDropdown";
import { FormMultiDropdown } from "./FormMultiDropdown";
import { FormQuillEditor } from "./FormQuillEditor";
import { ImageUploadField, MultiImageUploadField } from "./ImageUploadField";
import { FormLabel } from "./FormLabel";

function getError<T extends Record<string, unknown>>(
  formik: FormikProps<T>,
  name: keyof T & string | string
) {
  const touched = getIn(formik.touched, name);
  const error = getIn(formik.errors, name);
  return touched && error ? String(error) : undefined;
}

type BaseFieldProps<T extends Record<string, unknown>> = {
  formik: FormikProps<T>;
  name: keyof T & string | string;
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
};

export function FormInput<T extends Record<string, unknown>>({
  formik,
  name,
  label,
  required,
  hint,
  className,
  type = "text",
  ...props
}: BaseFieldProps<T> & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      label={label}
      required={required}
      name={name}
      type={type}
      value={String(getIn(formik.values, name) ?? "")}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={getError(formik, name)}
      hint={hint}
      className={className}
      {...props}
    />
  );
}

export function FormTextarea<T extends Record<string, unknown>>({
  formik,
  name,
  label,
  required,
  hint,
  className,
  rows = 4,
}: BaseFieldProps<T> & { rows?: number }) {
  const error = getError(formik, name);

  return (
    <div className={className}>
      <FormLabel label={label} required={required} />
      <textarea
        name={name}
        rows={rows}
        value={String(getIn(formik.values, name) ?? "")}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/15 ${
          error ? "border-red-500" : "border-zinc-300"
        }`}
      />
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-sm text-zinc-500">{hint}</p>}
    </div>
  );
}

export function FormSelect<T extends Record<string, unknown>>({
  formik,
  name,
  label,
  required,
  hint,
  className,
  options,
  placeholder = "Select...",
}: BaseFieldProps<T> & {
  options: Array<{ label: string; value: string | number }>;
  placeholder?: string;
}) {
  const error = getError(formik, name);
  const rawValue = getIn(formik.values, name);

  return (
    <FormDropdown
      label={label}
      required={required}
      value={rawValue === "" || rawValue == null ? "" : rawValue}
      onChange={(value) => {
        const option = options.find((item) => String(item.value) === value);
        const nextValue =
          option && typeof option.value === "number" ? Number(value) : value;
        void formik.setFieldValue(name, nextValue);
      }}
      onBlur={() => void formik.setFieldTouched(name, true)}
      options={options}
      placeholder={placeholder}
      error={error}
      hint={hint}
      className={className}
    />
  );
}

export function FormMultiSelect<T extends Record<string, unknown>>({
  formik,
  name,
  label,
  required,
  hint,
  className,
  options,
  placeholder = "Select...",
}: BaseFieldProps<T> & {
  options: Array<{ label: string; value: string | number }>;
  placeholder?: string;
}) {
  const error = getError(formik, name);
  const selected = Array.isArray(getIn(formik.values, name))
    ? (getIn(formik.values, name) as Array<string | number>).map((item) => Number(item))
    : [];

  return (
    <FormMultiDropdown
      label={label}
      required={required}
      value={selected}
      onChange={(values) => void formik.setFieldValue(name, values)}
      onBlur={() => void formik.setFieldTouched(name, true)}
      options={options}
      placeholder={placeholder}
      error={error}
      hint={hint}
      className={className}
    />
  );
}

export function FormQuill<T extends Record<string, unknown>>({
  formik,
  name,
  label,
  required,
  hint,
  className,
  minHeight = 200,
  placeholder,
}: BaseFieldProps<T> & { minHeight?: number; placeholder?: string }) {
  const error = getError(formik, name);

  return (
    <FormQuillEditor
      label={label}
      required={required}
      value={String(getIn(formik.values, name) ?? "")}
      onChange={(content) => void formik.setFieldValue(name, content)}
      onBlur={() => void formik.setFieldTouched(name, true)}
      error={error}
      hint={hint}
      className={className}
      minHeight={minHeight}
      placeholder={placeholder}
    />
  );
}

export function FormImageUpload<T extends Record<string, unknown>>({
  formik,
  name,
  label,
  uploadPath,
  required,
  hint,
  className,
  mediaType = "image",
}: BaseFieldProps<T> & {
  uploadPath: string;
  mediaType?: "image" | "video";
}) {
  const error = getError(formik, name);

  return (
    <ImageUploadField
      label={label}
      required={required}
      value={String(getIn(formik.values, name) ?? "")}
      onChange={(url) => void formik.setFieldValue(name, url)}
      uploadPath={uploadPath}
      error={error}
      hint={hint}
      className={className}
      mediaType={mediaType}
    />
  );
}

export function FormMultiImageUpload<T extends Record<string, unknown>>({
  formik,
  name,
  label,
  uploadPath,
  required,
  hint,
  className,
}: BaseFieldProps<T> & { uploadPath: string }) {
  const error = getError(formik, name);
  const values = Array.isArray(getIn(formik.values, name))
    ? (getIn(formik.values, name) as string[])
    : [];

  return (
    <MultiImageUploadField
      label={label}
      required={required}
      values={values}
      onChange={(urls) => void formik.setFieldValue(name, urls)}
      uploadPath={uploadPath}
      error={error}
      hint={hint}
      className={className}
    />
  );
}

export function FormToggle<T extends Record<string, unknown>>({
  formik,
  name,
  label,
  required,
  className,
}: BaseFieldProps<T>) {
  const checked = Boolean(getIn(formik.values, name));

  return (
    <div className={className}>
      <FormLabel label={label} required={required} />
      <div className="flex h-[42px] items-center justify-end rounded-lg border border-zinc-200 bg-zinc-50 px-3.5">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={() => formik.setFieldValue(name, !checked)}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
            checked ? "bg-admin-primary" : "bg-zinc-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export function FormCheckbox<T extends Record<string, unknown>>({
  formik,
  name,
  label,
  className,
}: BaseFieldProps<T>) {
  return (
    <label className={`flex items-center gap-2 text-sm text-zinc-700 ${className ?? ""}`}>
      <input
        type="checkbox"
        name={name}
        checked={Boolean(formik.values[name])}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className="h-4 w-4 rounded border-zinc-300 text-admin-primary focus:ring-admin-primary/20"
      />
      {label}
    </label>
  );
}

export function FormActions({
  isEdit,
  isSubmitting,
  entityLabel,
  onCancel,
}: {
  isEdit: boolean;
  isSubmitting: boolean;
  entityLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-3 border-t border-zinc-100 pt-6">
      <Button type="button" variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Saving..."
          : isEdit
            ? `Update ${entityLabel}`
            : `Create ${entityLabel}`}
      </Button>
    </div>
  );
}

export function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

export function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{children}</div>;
}

export function FormFullWidth({ children }: { children: React.ReactNode }) {
  return <div className="md:col-span-2">{children}</div>;
}
