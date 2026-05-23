import { CrudPage } from "@/components/admin/CrudPage";

export default function AdminEmailConfigPage() {
  return (
    <CrudPage
      title="Email configuration"
      resourcePath="/admin/email-config"
      columns={[
        { key: "providerType", label: "Provider" },
        { key: "host", label: "Host" },
        { key: "fromAddress", label: "From" },
        { key: "isActive", label: "Active" },
      ]}
      fields={[
        {
          name: "providerType",
          label: "Provider",
          type: "select",
          options: [
            { value: "SMTP", label: "SMTP" },
            { value: "MAILGUN", label: "MAILGUN" },
          ],
        },
        { name: "host", label: "Host", type: "text" },
        { name: "port", label: "Port", type: "number" },
        { name: "secure", label: "Secure TLS", type: "checkbox" },
        { name: "username", label: "Username", type: "text" },
        { name: "password", label: "Password", type: "password" },
        { name: "fromAddress", label: "From address", type: "email" },
        { name: "isActive", label: "Active", type: "checkbox" },
      ]}
    />
  );
}
