import { CrudPage } from "@/components/admin/CrudPage";

export default function AdminAppointmentsPage() {
  return (
    <CrudPage
      title="Appointments"
      resourcePath="/admin/appointments"
      allowCreate={false}
      columns={[
        { key: "contactName", label: "Contact" },
        { key: "contactEmail", label: "Email" },
        { key: "appointmentDate", label: "Date" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { name: "appointmentDate", label: "Date (YYYY-MM-DD)", type: "date" },
        { name: "appointmentTime", label: "Time (HH:MM)", type: "time" },
        { name: "contactName", label: "Contact name", type: "text" },
        { name: "contactEmail", label: "Contact email", type: "email" },
        { name: "contactPhone", label: "Phone", type: "text" },
        { name: "reason", label: "Reason", type: "textarea" },
        { name: "status", label: "Status", type: "text" },
      ]}
    />
  );
}
