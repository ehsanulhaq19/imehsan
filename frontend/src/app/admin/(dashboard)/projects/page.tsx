import { CrudPage } from "@/components/admin/CrudPage";

export default function AdminProjectsPage() {
  return (
    <CrudPage
      title="Projects"
      resourcePath="/admin/projects"
      columns={[
        { key: "slug", label: "Slug" },
        { key: "heading", label: "Heading" },
        { key: "coverImageUrl", label: "Cover" },
        { key: "published", label: "Published" },
      ]}
      fields={[
        { name: "slug", label: "Slug", type: "text" },
        { name: "heading", label: "Heading", type: "text" },
        { name: "coverImageUrl", label: "Cover image", type: "image-upload" },
        { name: "details", label: "Details", type: "richtext" },
        { name: "link", label: "Link", type: "url" },
        { name: "sortOrder", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
    />
  );
}
