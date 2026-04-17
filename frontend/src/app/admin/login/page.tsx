"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginAdmin, type LoginResponse } from "@/api/auth";

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
      router.push("/admin");
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20 md:py-28">
      <h1 className="font-display text-2xl uppercase text-black">Admin sign in</h1>
      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-black">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="hcode-input normal-case tracking-normal"
          />
        </label>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-black">
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
        {err ? <p className="text-sm text-[#c24742]">{err}</p> : null}
      </form>
      <Link href="/" className="mt-10 hcode-link text-center text-[11px] font-semibold uppercase tracking-[0.2em]">
        ← Back to site
      </Link>
    </div>
  );
}

