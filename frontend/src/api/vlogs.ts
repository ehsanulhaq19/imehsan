import { fetchJson, fetchApi } from "./client";

export function fetchVlogsList<T>() {
  return fetchJson<T>("/vlogs");
}

export function fetchVlogBySlug<T>(slug: string) {
  return fetchJson<T>(`/vlogs/${slug}`);
}

export function submitVlogVote(slug: string, body: { visitorKey: string; value: number }) {
  return fetchApi(`/vlogs/${slug}/votes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function submitVlogComment(
  slug: string,
  body: { body: string; authorName?: string },
) {
  return fetchApi(`/vlogs/${slug}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
