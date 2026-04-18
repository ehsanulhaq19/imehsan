import { fetchJson } from "./client";

export type CertificationListRow = {
  id: string;
  slug: string;
  heading: string;
  detail?: string | null;
  linkUrl?: string | null;
  thumbnailUrl?: string | null;
};

export function fetchCertificationsList<T extends CertificationListRow[]>() {
  return fetchJson<T>("/certifications");
}

export function fetchCertificationBySlug<T>(slug: string) {
  return fetchJson<T>(`/certifications/${encodeURIComponent(slug)}`);
}
