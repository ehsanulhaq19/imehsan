"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const publicChrome =
  "relative isolate flex min-h-[100svh] flex-col bg-brand-bg font-brand text-fp-body text-brand-fg [-webkit-font-smoothing:antialiased]";

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "/";
  const isAdmin = path.startsWith("/admin");

  if (isAdmin) {
    return (
      <div className="flex min-h-[100svh] flex-col bg-background font-brand text-fp-body text-foreground [-webkit-font-smoothing:antialiased]">
        {children}
      </div>
    );
  }

  return (
    <div className={publicChrome}>
      <SiteHeader />
      <main className="min-h-0 flex-1 shrink-0 overflow-x-clip pt-[5.75rem] md:pt-[6.5rem]">{children}</main>
      <SiteFooter />
    </div>
  );
}
