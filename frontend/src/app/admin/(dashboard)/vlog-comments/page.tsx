import { redirect } from "next/navigation";

/** Comments are managed under Vlogs → row → modal Comments tab */
export default function AdminVlogCommentsRedirectPage() {
  redirect("/admin/vlogs");
}
