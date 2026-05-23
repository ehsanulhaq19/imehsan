import { CrudPage } from "@/components/admin/CrudPage";

export default function AdminVlogCommentsPage() {
  return (
    <CrudPage
      title="Vlog comments"
      resourcePath="/admin/vlogs/comments"
      allowCreate={false}
      columns={[
        { key: "vlog.heading", label: "Vlog" },
        { key: "authorName", label: "Author" },
        { key: "body", label: "Body" },
        { key: "createdAt", label: "Created" },
      ]}
      fields={[
        { name: "authorName", label: "Author", type: "text" },
        { name: "body", label: "Body", type: "textarea" },
      ]}
    />
  );
}
