import { CrudPage } from "@/components/admin/CrudPage";

export default function AdminTestimonialsPage() {
  return (
    <CrudPage
      title="Testimonials"
      resourcePath="/admin/testimonials"
      columns={[
        { key: "authorName", label: "Author" },
        { key: "coverImageUrl", label: "Cover" },
        { key: "approved", label: "Approved" },
      ]}
      fields={[
        { name: "authorName", label: "Author", type: "text" },
        { name: "coverImageUrl", label: "Cover image", type: "image-upload" },
        { name: "quote", label: "Quote", type: "textarea" },
        { name: "approved", label: "Approved", type: "checkbox" },
        { name: "sortOrder", label: "Sort order", type: "number" },
      ]}
    />
  );
}
