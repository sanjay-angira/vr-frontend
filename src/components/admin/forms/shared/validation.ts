import * as Yup from "yup";

export const requiredString = (label: string, min = 2, max = 255) =>
  Yup.string()
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must not exceed ${max} characters`)
    .required(`${label} is required`);

export const slugField = (label = "Slug") =>
  requiredString(label, 3, 100).matches(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    `${label} must be URL-friendly`
  );

export const optionalUrl = Yup.string()
  .trim()
  .nullable()
  .test("url", "Please enter a valid URL (http:// or https://)", (value) => {
    if (!value) return true;
    return /^https?:\/\/.+/i.test(value);
  });

export const activeField = Yup.boolean().default(true);

export const htmlMinLength = (label: string, min: number) =>
  Yup.string()
    .required(`${label} is required`)
    .test("html-min", `${label} must be at least ${min} characters`, (value) => {
      if (!value) return false;
      const stripped = value.replace(/<[^>]*>/g, "").trim();
      return stripped.length >= min;
    });

export const hexColor = Yup.string()
  .nullable()
  .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color code");
