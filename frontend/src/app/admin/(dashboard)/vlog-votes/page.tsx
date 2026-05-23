import { CrudPage } from "@/components/admin/CrudPage";

export default function AdminVlogVotesPage() {
  return (
    <CrudPage
      title="Vlog votes"
      resourcePath="/admin/vlogs/votes"
      allowCreate={false}
      allowEdit={false}
      columns={[
        { key: "vlog.heading", label: "Vlog" },
        { key: "visitorKey", label: "Visitor key" },
        { key: "value", label: "Value" },
        { key: "createdAt", label: "Created" },
      ]}
      fields={[]}
    />
  );
}
