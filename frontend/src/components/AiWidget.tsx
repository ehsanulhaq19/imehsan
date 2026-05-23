"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sendAiChat } from "@/api/ai";
import { content } from "@/lib/content-registry";

type Msg = { role: "user" | "assistant"; text: string };

const AW = content.aiWidget;

function IconExpandPanel({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m-5.25 16.5v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
      />
    </svg>
  );
}

function IconCollapsePanel({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
      />
    </svg>
  );
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function IconSparkles({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
      />
    </svg>
  );
}

function visitorKey(): string {
  if (typeof window === "undefined") return "ssr";
  let k = window.localStorage.getItem("visitor_key");
  if (!k) {
    k = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    window.localStorage.setItem("visitor_key", k);
  }
  return k;
}

const hdrBtn =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-outline-soft/40 text-brand-secondary transition-colors hover:border-brand-tertiary/50 hover:bg-brand-surface-low hover:text-brand-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-tertiary/40";

const fieldClass =
  "mt-2 w-full rounded-lg border border-brand-outline-soft/55 bg-brand-white px-3 py-2.5 font-brand text-[13px] font-normal normal-case tracking-normal text-brand-fg shadow-sm outline-none ring-0 placeholder:text-brand-muted/50 focus:border-brand-tertiary focus:ring-2 focus:ring-brand-tertiary/20";

export function AiWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [introDone, setIntroDone] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const sid = useMemo(() => visitorKey(), []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  const sendChat = useCallback(
    async (message: string) => {
      setBusy(true);
      setMsgs((m) => [...m, { role: "user", text: message }]);
      try {
        const res = await sendAiChat({
          guestSessionId: sid,
          guestName: name.trim() || undefined,
          guestEmail: email.trim() || undefined,
          message,
        });
        const data = res.ok ? await res.json() : { reply: AW.chat.fallbackReply };
        setMsgs((m) => [...m, { role: "assistant", text: data.reply || "" }]);
      } finally {
        setBusy(false);
      }
    },
    [email, name, sid],
  );

  const onSubmitIntro = () => {
    setIntroDone(true);
    setMsgs([{ role: "assistant", text: AW.greeting }]);
  };

  const onSend = async () => {
    const t = input.trim();
    if (!t || busy) return;
    setInput("");
    await sendChat(t);
  };

  const launcherPos = "bottom-5 right-5 sm:right-6 md:bottom-8 md:right-10";

  return (
    <>
      {!open ? (
        <button
          type="button"
          aria-label={AW.launcher.ariaLabel}
          className={`group fixed ${launcherPos} z-[120] inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-full border border-brand-outline-soft/45 bg-brand-secondary py-3 pl-4 pr-4 text-white shadow-[0_10px_40px_-6px_rgb(30_54_92_/0.45)] transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_16px_48px_-8px_rgb(30_54_92_/0.55)] md:py-4 md:pl-5 md:pr-5`}
          onClick={() => setOpen(true)}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/18 ring-2 ring-white/25 transition-colors group-hover:bg-white/26">
            <IconSparkles className="h-5 w-5 text-white" />
          </span>
          <span className="hidden max-w-0 overflow-hidden whitespace-nowrap font-brand text-[13px] font-semibold tracking-wide transition-all duration-300 group-hover:max-w-[10rem] sm:inline sm:group-hover:pl-1">
            {AW.launcher.pillLabel}
          </span>
        </button>
      ) : null}

      {open ? (
        <>
          <div role="presentation" className="fixed inset-0 z-[115] bg-brand-fg/20 backdrop-blur-[2px] md:bg-brand-fg/15" aria-hidden onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-labelledby="ai-widget-heading"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className={`fixed bottom-4 right-4 z-[116] flex max-h-[min(92svh,44rem)] min-h-[min(480px,70svh)] flex-col overflow-hidden rounded-2xl border border-brand-outline-soft/50 bg-brand-white shadow-[0_24px_64px_-12px_rgb(11_28_48_/0.28)] ring-1 ring-white/70 md:bottom-8 md:right-10 ${
              expanded ? "w-[min(96vw,40rem)]" : "w-[min(94vw,22.5rem)]"
            }`}
          >
            <div className="relative flex shrink-0 items-start gap-3 border-b border-brand-outline-soft/35 bg-gradient-to-br from-brand-surface-low via-brand-white to-brand-white px-4 py-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tertiary text-white shadow-sm ring-1 ring-brand-tertiary/30">
                <IconSparkles className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5" id="ai-widget-heading">
                <p className="font-brand text-[13px] font-semibold tracking-tight text-brand-fg">{AW.panel.title}</p>
                <p className="font-brand-mono mt-1 text-[10px] uppercase tracking-[0.24em] text-brand-secondary">{AW.panel.subtitle}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" className={hdrBtn} aria-label={expanded ? AW.panel.collapseAria : AW.panel.expandAria} onClick={() => setExpanded((e) => !e)}>
                  {expanded ? <IconCollapsePanel className="h-[18px] w-[18px]" /> : <IconExpandPanel className="h-[18px] w-[18px]" />}
                </button>
                <button type="button" className={hdrBtn} aria-label={AW.panel.closeAria} onClick={() => setOpen(false)}>
                  <IconClose className="h-[18px] w-[18px]" />
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-brand-bg/[0.45] px-4 py-4 [-webkit-overflow-scrolling:touch]">
              {!introDone ? (
                <div className="flex flex-col gap-4">
                  <p className="font-brand text-[14px] font-normal leading-relaxed text-brand-muted">{AW.greeting}</p>
                  <label className="font-brand text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-secondary">
                    {AW.intro.nameLabel}{" "}
                    <span className="font-normal normal-case tracking-normal text-brand-muted/75">{AW.intro.nameOptional}</span>
                    <input className={fieldClass} placeholder={AW.intro.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} />
                  </label>
                  <label className="font-brand text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-secondary">
                    {AW.intro.emailLabel}{" "}
                    <span className="font-normal normal-case tracking-normal text-brand-muted/75">{AW.intro.emailOptional}</span>
                    <input className={fieldClass} type="email" placeholder={AW.intro.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} />
                  </label>
                  <button
                    type="button"
                    className="mt-1 rounded-xl bg-brand-secondary py-3.5 font-brand text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-md transition-opacity hover:opacity-92"
                    onClick={onSubmitIntro}
                  >
                    {AW.intro.continue}
                  </button>
                </div>
              ) : (
                <>
                  {msgs.map((m, i) => (
                    <div
                      key={`${i}-${m.role}`}
                      className={
                        m.role === "user"
                          ? "ml-5 rounded-2xl rounded-br-md border border-brand-outline-soft/30 bg-brand-white px-3.5 py-2.5 text-right font-brand text-[14px] leading-[1.62] text-brand-fg shadow-sm"
                          : "mr-5 rounded-2xl rounded-bl-md border border-brand-tertiary/25 bg-brand-surface px-3.5 py-2.5 font-brand text-[14px] leading-[1.68] text-brand-muted shadow-sm"
                      }
                    >
                      {m.text}
                    </div>
                  ))}
                  {busy ? (
                    <p className="mr-5 flex items-center gap-2 font-brand-mono text-[10px] font-medium uppercase tracking-[0.14em] text-brand-secondary">
                      <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-brand-tertiary" aria-hidden /> {AW.chat.thinking}
                    </p>
                  ) : null}
                  <div ref={endRef} />
                </>
              )}
            </div>

            {introDone ? (
              <div className="flex shrink-0 gap-2 border-t border-brand-outline-soft/40 bg-brand-white p-3">
                <input
                  className={`${fieldClass} m-0 flex-1`}
                  placeholder={AW.chat.inputPlaceholder}
                  value={input}
                  disabled={busy}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void onSend()}
                />
                <button
                  type="button"
                  disabled={busy}
                  className="shrink-0 rounded-xl bg-brand-tertiary px-5 py-2.5 font-brand text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm transition-opacity disabled:opacity-45 hover:enabled:opacity-92"
                  onClick={() => void onSend()}
                >
                  {AW.chat.send}
                </button>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
}
