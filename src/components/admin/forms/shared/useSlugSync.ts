"use client";

import { useEffect, useRef } from "react";
import type { FormikProps } from "formik";
import { generateSlug } from "./generateSlug";

export function useSlugSync<T extends Record<string, unknown>>(
  formik: FormikProps<T>,
  nameField: keyof T & string,
  slugField: keyof T & string,
  enabled: boolean
) {
  const slugManuallyEdited = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const name = String(formik.values[nameField] ?? "");
    const slug = String(formik.values[slugField] ?? "");

    if (!slugManuallyEdited.current && name) {
      const nextSlug = generateSlug(name);
      if (slug !== nextSlug) {
        formik.setFieldValue(slugField, nextSlug);
      }
    }
  }, [enabled, formik.values[nameField]]);

  
  useEffect(() => {
    if (!enabled) return;

    const name = String(formik.values[nameField] ?? "");
    const slug = String(formik.values[slugField] ?? "");

    if (name && slug !== generateSlug(name)) {
      slugManuallyEdited.current = true;
    }
  }, [enabled, formik.values[slugField]]);
}
