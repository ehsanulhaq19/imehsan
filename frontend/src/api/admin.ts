import { fetchApi } from "./client";

export function fetchAdmin(path: string, token: string) {
  return fetchApi(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
