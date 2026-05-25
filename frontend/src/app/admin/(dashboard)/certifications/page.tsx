import { CrudPage } from "@/components/admin/CrudPage";

export default function AdminCertificationsPage() {
  return (
    <CrudPage
      title="Certifications"
      resourcePath="/admin/certifications"
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
        { name: "detail", label: "Detail", type: "richtext" },
        { name: "linkUrl", label: "Link URL", type: "url" },
        { name: "sortOrder", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
    />
  );
}
