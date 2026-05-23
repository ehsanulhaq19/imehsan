import { CrudPage } from "@/components/admin/CrudPage";

export default function AdminGitReposPage() {
  return (
    <CrudPage
      title="Repositories"
      resourcePath="/admin/git-repos"
      columns={[
        { key: "name", label: "Name" },
        { key: "url", label: "URL" },
      ]}
      fields={[
        { name: "name", label: "Name", type: "text" },
        { name: "url", label: "URL", type: "url" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "sortOrder", label: "Sort order", type: "number" },
      ]}
    />
  );
}
