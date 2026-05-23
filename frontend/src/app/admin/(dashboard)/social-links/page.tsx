import { CrudPage } from "@/components/admin/CrudPage";

export default function AdminSocialLinksPage() {
  return (
    <CrudPage
      title="Social links"
      resourcePath="/admin/social-links"
      columns={[
        { key: "name", label: "Name" },
        { key: "linkUrl", label: "Link" },
      ]}
      fields={[
        { name: "name", label: "Name", type: "text" },
        { name: "iconUrl", label: "Icon URL", type: "url" },
        { name: "linkUrl", label: "Link URL", type: "url" },
        { name: "sortOrder", label: "Sort order", type: "number" },
      ]}
    />
  );
}
