type FormLabelProps = {
  label: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
};

export function FormLabel({ label, required, htmlFor, className }: FormLabelProps) {
  if (!label.trim()) return null;

  return (
    <label
      htmlFor={htmlFor}
      className={`mb-1.5 block text-sm font-medium text-zinc-700 ${className ?? ""}`}
    >
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
}
