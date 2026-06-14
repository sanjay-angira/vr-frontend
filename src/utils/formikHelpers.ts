export const getError = (formik: any, name: string) => {
    return (formik.touched[name] || formik.dirty) && formik.errors[name];
};