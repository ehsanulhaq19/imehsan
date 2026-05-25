import { redirect } from "next/navigation";

/** Votes/likes are managed under Vlogs → row → modal Likes/dislikes tab */
export default function AdminVlogVotesRedirectPage() {
  redirect("/admin/vlogs");
}
