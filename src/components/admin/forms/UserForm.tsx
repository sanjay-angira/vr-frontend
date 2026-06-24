"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import type { AdminFormProps } from "./types";
import { AdminFormLayout } from "./shared/AdminFormLayout";
import {
  FormActions,
  FormFullWidth,
  FormImageUpload,
  FormInput,
  FormMultiSelect,
  FormSection,
  FormToggle,
} from "./shared/FormFields";
import { fetchRolesOptions } from "./shared/fetchOptions";
import { UPLOAD_PATHS } from "./shared/uploadPaths";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { activeField, requiredString } from "./shared/validation";

type Values = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roleIds: number[];
  profileImage: string;
  isActive: boolean;
};

const initialValues: Values = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  roleIds: [],
  profileImage: "",
  isActive: false,
};

const schema = Yup.object({
  firstName: requiredString("First name", 1, 30),
  lastName: requiredString("Last name", 1, 30),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{5,10}$/, "Phone must be 5-10 digits")
    .required("Phone number is required"),
  roleIds: Yup.array().of(Yup.number()).min(1, "Select at least one role"),
  profileImage: Yup.string(),
  isActive: activeField,
});

export function UserForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const [roles, setRoles] = useState<Array<{ label: string; value: string | number }>>([]);

  useEffect(() => {
    fetchRolesOptions().then(setRoles);
  }, []);

  const { formik, loading, loadError, isEdit } = useAdminCrudForm<Values>({
    module,
    recordId,
    initialValues,
    validationSchema: schema,
    mapRecordToValues: (r) => ({
      firstName: String(r.firstName ?? ""),
      lastName: String(r.lastName ?? ""),
      email: String(r.email ?? ""),
      phoneNumber: String(r.phoneNumber ?? ""),
      roleIds: Array.isArray(r.roleIds)
        ? (r.roleIds as number[])
        : Array.isArray(r.userRoles)
          ? (r.userRoles as Array<{ role?: { id?: number } }>)
              .map((ur) => ur.role?.id)
              .filter(Boolean) as number[]
          : [],
      profileImage: String(r.profileImage ?? ""),
      isActive: Boolean(r.isActive ?? false),
    }),
  });

  return (
    <AdminFormLayout
      title={isEdit ? "Edit User" : "Add User"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <FormSection title="User details">
          <FormInput formik={formik} name="firstName" label="First Name" required />
          <FormInput formik={formik} name="lastName" label="Last Name" required />
          <FormInput formik={formik} name="email" label="Email" type="email" required />
          <FormInput formik={formik} name="phoneNumber" label="Phone Number" required />
          <FormFullWidth>
            <FormMultiSelect formik={formik} name="roleIds" label="Roles" required options={roles} />
          </FormFullWidth>
          <FormFullWidth>
            <FormImageUpload formik={formik} name="profileImage" label="Profile Image" uploadPath={UPLOAD_PATHS.users} />
          </FormFullWidth>
          <FormFullWidth>
            <FormToggle formik={formik} name="isActive" label="Active Status" />
          </FormFullWidth>
        </FormSection>
        <FormActions
          isEdit={isEdit}
          isSubmitting={formik.isSubmitting}
          entityLabel="User"
          onCancel={() => router.push(`/admin/${module}`)}
        />
      </form>
    </AdminFormLayout>
  );
}
