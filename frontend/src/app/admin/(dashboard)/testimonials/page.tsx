import { CrudPage } from "@/components/admin/CrudPage";

export default function AdminTestimonialsPage() {
  return (
    <CrudPage
      title="Testimonials"
      resourcePath="/admin/testimonials"
      columns={[
        { key: "authorName", label: "Author" },
        { key: "approved", label: "Approved" },
      ]}
      fields={[
        { name: "authorName", label: "Author", type: "text" },
        { name: "quote", label: "Quote", type: "textarea" },
        { name: "approved", label: "Approved", type: "checkbox" },
        { name: "sortOrder", label: "Sort order", type: "number" },
      ]}
    />
  );
}
