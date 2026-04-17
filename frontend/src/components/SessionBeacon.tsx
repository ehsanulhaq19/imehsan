"use client";

import { useEffect } from "react";
import { createAnalyticsSession, recordAnalyticsPage } from "@/api/analytics";

function sid(): string {
  let k = typeof window !== "undefined" ? window.localStorage.getItem("visitor_key") : null;
  if (!k && typeof window !== "undefined") {
    k = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    window.localStorage.setItem("visitor_key", k);
  }
  return k || "anonymous";
}

export function SessionBeacon({ path }: { path: string }) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const visitorId = sid();
      const sessionRes = await createAnalyticsSession({
        visitorId,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      });
      if (!sessionRes.ok || cancelled) return;
      const session = (await sessionRes.json()) as { id?: string };
      if (!session?.id) return;
      await recordAnalyticsPage(session.id, path);
    })();
    return () => {
      cancelled = true;
    };
  }, [path]);

  return null;
}
