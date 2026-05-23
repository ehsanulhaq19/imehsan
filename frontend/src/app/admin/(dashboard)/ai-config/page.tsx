"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { adminFetch, readAdminToken } from "@/lib/admin-fetch";

type Cfg = {
  id: string;
  systemPrompt: string | null;
  model: string | null;
  temperature: number;
  maxTokens: number;
  hasApiKey: boolean;
};

export default function AdminAiConfigPage() {
  const token = useMemo(() => readAdminToken(), []);
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [model, setModel] = useState("");
  const [temperature, setTemperature] = useState("0.7");
  const [maxTokens, setMaxTokens] = useState("1024");
  const [apiKey, setApiKey] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      const res = await adminFetch("/admin/ai/config", token);
      if (!res.ok) return;
      const c = (await res.json()) as Cfg;
      setCfg(c);
      setSystemPrompt(c.systemPrompt ?? "");
      setModel(c.model ?? "");
      setTemperature(String(c.temperature ?? 0.7));
      setMaxTokens(String(c.maxTokens ?? 1024));
    })();
  }, [token]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setMsg(null);
    const body: Record<string, unknown> = {
      systemPrompt: systemPrompt.trim() || null,
      model: model.trim() || null,
      temperature: Number(temperature),
      maxTokens: Number(maxTokens),
    };
    if (apiKey.trim()) body.apiKey = apiKey.trim();
    const res = await adminFetch("/admin/ai/config", token, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    if (!res.ok) setMsg(`Save failed (${res.status})`);
    else {
      setMsg("Saved.");
      setApiKey("");
      const c = (await res.json()) as Cfg;
      setCfg(c);
    }
  }

  if (!token) {
    return (
      <p className="text-sm text-hcode-muted">
        Sign in required. <a href="/admin/login" className="hcode-link">Login</a>
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-xl uppercase tracking-[0.12em] text-black dark:text-neutral-100">AI widget</h1>
        <p className="mt-1 text-xs text-hcode-muted">
          Provider configuration used by the site assistant. {cfg?.hasApiKey ? "API key is stored." : "No dedicated API key saved — env fallback may apply."}
        </p>
      </div>

      <form onSubmit={onSave} className="space-y-4 border border-[var(--card-border)] bg-[var(--card-bg)] p-5 dark:border-neutral-700">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
          System prompt
          <textarea className="mt-1 min-h-[120px] w-full border border-hcode-input bg-white px-3 py-2 text-[11px] normal-case dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100" value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} />
        </label>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
          Model
          <input className="hcode-input normal-case tracking-normal" value={model} onChange={(e) => setModel(e.target.value)} />
        </label>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
          Temperature
          <input type="number" step="0.05" className="hcode-input normal-case tracking-normal" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
        </label>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
          Max tokens
          <input type="number" className="hcode-input normal-case tracking-normal" value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} />
        </label>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
          API key (optional)
          <input type="password" className="hcode-input normal-case tracking-normal" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={cfg?.hasApiKey ? "••••••••" : ""} />
        </label>
        {msg ? <p className="text-xs text-hcode-muted">{msg}</p> : null}
        <button type="submit" className="hcode-btn px-6 py-2 text-[10px]">
          Save configuration
        </button>
      </form>
    </div>
  );
}
