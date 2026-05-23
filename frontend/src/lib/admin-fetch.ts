import { apiBase } from "@/api/client";

export type PageMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type Paged<T> = { items: T[]; meta: PageMeta };

export function readAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("admin_token");
}

export async function adminFetch(path: string, token: string, init?: RequestInit) {
  const isForm = init?.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
    Authorization: `Bearer ${token}`,
  };
  if (!isForm) headers["Content-Type"] = "application/json";
  return fetch(`${apiBase}${path}`, { ...init, headers });
}
