"use client";



import { FormikProvider } from "formik";

import { useRouter } from "next/navigation";

import * as Yup from "yup";

import type { AdminFormProps } from "./types";

import { AdminFormLayout } from "./shared/AdminFormLayout";

import {

  FormActions,

  FormInput,

  FormSection,

  FormToggle,

} from "./shared/FormFields";

import { useAdminCrudForm } from "./shared/useAdminCrudForm";

import { requiredString } from "./shared/validation";



type Values = {

  name: string;

  isFilterable: boolean;

  isRequired: boolean;

};



const initialValues: Values = {

  name: "",

  isFilterable: true,

  isRequired: false,

};



const schema = Yup.object({

  name: requiredString("Name", 2, 100),

  isFilterable: Yup.boolean(),

  isRequired: Yup.boolean(),

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

      isFilterable: Boolean(r.isFilterable ?? true),

      isRequired: Boolean(r.isRequired ?? false),

    }),

    mapValuesToPayload: (v) => ({

      name: v.name.trim(),

      isFilterable: v.isFilterable,

      isRequired: v.isRequired,

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
            <FormToggle formik={formik} name="isFilterable" label="Filterable" />
            <FormToggle formik={formik} name="isRequired" label="Required" />
          </FormSection>

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

