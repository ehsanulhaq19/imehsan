import { fetchJson } from "./client";

export function fetchProjectsList<T>() {
  return fetchJson<T>("/projects");
}

export function fetchProjectBySlug<T>(slug: string) {
  return fetchJson<T>(`/projects/${slug}`);
}
