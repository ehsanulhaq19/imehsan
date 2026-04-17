"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAdmin } from "@/api/admin";

export default function AdminHomePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = sessionStorage.getItem("admin_token");
    if (!t) router.replace("/admin/login");
    setToken(t);
  }, [router]);

  const [checks, setChecks] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) return;
    const authToken = token;
    void (async () => {
      async function probe(path: string) {
        const res = await fetchAdmin(path, authToken);
        return res.ok ? "OK" : `Error ${res.status}`;
      }
      const entries = await Promise.all([
        ["projects", await probe("/admin/projects")],
        ["appointments", await probe("/admin/appointments")],
        ["ai", await probe("/admin/ai/conversations")],
        ["analytics", await probe("/admin/analytics/sessions")],
        ["email", await probe("/admin/email-config")],
        ["social-links", await probe("/admin/social-links")],
        ["certifications", await probe("/admin/certifications")],
      ]);
      setChecks(Object.fromEntries(entries));
    })();
  }, [token]);

  if (!token) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 text-hcode-muted md:py-20">
      <div className="flex items-center justify-between border-b border-hcode-border pb-6">
        <h1 className="font-display text-2xl uppercase text-black">Admin</h1>
        <button
          type="button"
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-hcode-muted hover:text-black"
          onClick={() => {
            sessionStorage.removeItem("admin_token");
            router.push("/admin/login");
          }}
        >
          Sign out
        </button>
      </div>
      <p className="mt-6 text-sm leading-relaxed">
        Use the API with your bearer token, or extend this dashboard. Quick endpoint checks:
      </p>
      <ul className="mt-8 space-y-3 border border-hcode-border bg-white p-6 text-sm">
        {Object.entries(checks).map(([k, v]) => (
          <li key={k} className="flex justify-between gap-4 border-b border-hcode-border pb-3 last:border-0 last:pb-0">
            <span className="font-medium text-black">{k}</span>
            <span className="text-right">{v}</span>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm leading-relaxed text-hcode-muted">
        Upload media via{" "}
        <code className="border border-hcode-border bg-hcode-gray px-1.5 py-0.5 text-xs">POST /api/admin/media/upload</code>{" "}
        with multipart field{" "}
        <code className="border border-hcode-border bg-hcode-gray px-1.5 py-0.5 text-xs">file</code>.
      </p>
      <Link href="/" className="mt-8 inline-block hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]">
        ← Site home
      </Link>
    </div>
  );
}

