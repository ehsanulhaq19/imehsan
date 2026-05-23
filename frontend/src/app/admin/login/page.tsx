"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginAdmin, type LoginResponse } from "@/api/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await loginAdmin(email, password);
    if (!res.ok) {
      setErr("Login failed");
      return;
    }
    const data = (await res.json()) as LoginResponse;
    if (data.access_token) {
      sessionStorage.setItem("admin_token", data.access_token);
      if (data.user) sessionStorage.setItem("admin_user", JSON.stringify(data.user));
      router.push("/admin");
    }
  }

  return (
    <div className="relative mx-auto flex max-w-md flex-col px-4 py-20 md:py-28">
      <div className="absolute right-4 top-6 md:right-0 md:top-8">
        <ThemeToggle />
      </div>
      <h1 className="font-display text-2xl uppercase text-black dark:text-neutral-100">Admin sign in</h1>
      <p className="mt-2 text-xs text-hcode-muted">System accounts only.</p>
      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="hcode-input normal-case tracking-normal"
          />
        </label>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="hcode-input normal-case tracking-normal"
          />
        </label>
        <button type="submit" className="hcode-btn w-full">
          Sign in
        </button>
        {err ? <p className="text-sm text-red-600 dark:text-red-400">{err}</p> : null}
      </form>
      <Link href="/" className="mt-10 hcode-link text-center text-[11px] font-semibold uppercase tracking-[0.2em]">
        ← Back to site
      </Link>
    </div>
  );
}
