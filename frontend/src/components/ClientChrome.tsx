"use client";

import { usePathname } from "next/navigation";
import { AiWidget } from "./AiWidget";
import { SessionBeacon } from "./SessionBeacon";

export function ClientChrome() {
  const path = usePathname() || "/";
  const isAdmin = path.startsWith("/admin");
  return (
    <>
      <SessionBeacon path={path} />
      {!isAdmin ? <AiWidget /> : null}
    </>
  );
}
