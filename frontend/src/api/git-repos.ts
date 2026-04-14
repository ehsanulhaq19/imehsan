import { fetchJson } from "./client";

export function fetchGitReposList<T>() {
  return fetchJson<T>("/git-repos");
}
