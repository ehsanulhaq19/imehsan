import { fetchApi } from "./client";

export type AnalyticsSessionBody = { visitorId: string; userAgent?: string };

export function createAnalyticsSession(body: AnalyticsSessionBody) {
  return fetchApi("/analytics/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function recordAnalyticsPage(sessionId: string, path: string) {
  return fetchApi(`/analytics/sessions/${sessionId}/pages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
}
