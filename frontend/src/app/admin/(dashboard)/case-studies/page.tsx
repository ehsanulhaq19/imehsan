import { CrudPage } from "@/components/admin/CrudPage";

export default function AdminCaseStudiesPage() {
  return (
    <CrudPage
      title="Case studies"
      resourcePath="/admin/case-studies"
      columns={[
        { key: "slug", label: "Slug" },
        { key: "title", label: "Title" },
        { key: "published", label: "Published" },
      ]}
      fields={[
        { name: "slug", label: "Slug", type: "text" },
        { name: "title", label: "Title", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "externalLink", label: "External link", type: "url" },
        { name: "sortOrder", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
    />
  );
}
