import { fetchJson } from "./client";

export function fetchTestimonialsList<T>() {
  return fetchJson<T>("/testimonials");
}
