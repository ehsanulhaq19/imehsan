import { fetchApi } from "./client";

export type LoginResponse = { access_token?: string };

export function loginAdmin(email: string, password: string) {
  return fetchApi("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}
