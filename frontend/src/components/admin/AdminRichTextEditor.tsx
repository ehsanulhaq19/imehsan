"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="min-h-[160px] animate-pulse rounded-lg bg-brand-surface-low/80 dark:bg-white/10" aria-hidden />,
});

type Props = {
  id?: string;
  value: string;
  onChange: (html: string) => void;
};

export function AdminRichTextEditor({ id, value, onChange }: Props) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        ["link"],
        ["clean"],
      ],
    }),
    [],
  );

  const formats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "bullet",
      "blockquote",
      "code-block",
      "link",
    ],
    [],
  );

  return (
    <div id={id} className="admin-quill-wrapper mt-1 overflow-hidden rounded-lg border border-hcode-input bg-card focus-within:border-brand-tertiary focus-within:ring-2 focus-within:ring-brand-tertiary/20 dark:border-neutral-600">
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        formats={formats}
        className="font-brand text-fp-small"
      />
    </div>
  );
}
