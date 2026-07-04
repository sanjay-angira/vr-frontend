"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import "react-quill-new/dist/quill.snow.css";
import { FormLabel } from "./FormLabel";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[200px] animate-pulse rounded-lg border border-zinc-200 bg-zinc-50" />
  ),
});

type FormQuillEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  error?: string;
  hint?: string;
  minHeight?: number;
  placeholder?: string;
  className?: string;
};

export function FormQuillEditor({
  label,
  value,
  onChange,
  onBlur,
  required,
  error,
  hint,
  minHeight = 200,
  placeholder = "Product Description",
  className,
}: FormQuillEditorProps) {
  const [editorValue, setEditorValue] = useState(value);
  const [remountKey, setRemountKey] = useState(0);
  const lastEmittedValue = useRef(value);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  useEffect(() => {
    if (value === lastEmittedValue.current) return;

    lastEmittedValue.current = value;
    setEditorValue(value);

    // ReactQuill only reads the initial value on mount — remount when data loads async.
    if (value.trim()) {
      setRemountKey((current) => current + 1);
    }
  }, [value]);

  function handleChange(content: string) {
    lastEmittedValue.current = content;
    setEditorValue(content);
    onChange(content);
  }

  return (
    <div className={className}>
      <FormLabel label={label} required={required} />
      <div
        className={`quill-admin-editor overflow-hidden rounded-lg border bg-white text-zinc-900 ${
          error
            ? "border-red-500"
            : "border-zinc-300 focus-within:border-admin-primary focus-within:ring-2 focus-within:ring-admin-primary/15"
        }`}
      >
        <ReactQuill
          key={remountKey}
          theme="snow"
          value={editorValue}
          onChange={handleChange}
          onBlur={onBlur}
          modules={modules}
          placeholder={placeholder}
          style={{ minHeight }}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-sm text-zinc-500">{hint}</p>}
    </div>
  );
}
