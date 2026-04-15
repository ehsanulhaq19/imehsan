import { fetchApi } from "./client";

export function submitAppointment(formData: FormData) {
  return fetchApi("/appointments", { method: "POST", body: formData });
}
