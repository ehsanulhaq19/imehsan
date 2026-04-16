"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sendAiChat } from "@/api/ai";
import { WIDGET_GREETING } from "@/lib/ai-copy";

type Msg = { role: "user" | "assistant"; text: string };

function visitorKey(): string {
  if (typeof window === "undefined") return "ssr";
  let k = window.localStorage.getItem("visitor_key");
  if (!k) {
    k = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    window.localStorage.setItem("visitor_key", k);
  }
  return k;
}

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
        const data = res.ok ? await res.json() : { reply: "Assistant unavailable." };
        setMsgs((m) => [...m, { role: "assistant", text: data.reply || "" }]);
      } finally {
        setBusy(false);
      }
    },
    [email, name, sid],
  );

  const onSubmitIntro = () => {
    setIntroDone(true);
    setMsgs([{ role: "assistant", text: WIDGET_GREETING }]);
  };

  const onSend = async () => {
    const t = input.trim();
    if (!t || busy) return;
    setInput("");
    await sendChat(t);
  };

  return (
    <>
      {!open ? (
        <button
          type="button"
          aria-label="Open assistant"
          className="fixed bottom-5 right-5 z-50 border-2 border-hcode-violet bg-hcode-violet px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-lg transition-colors hover:bg-transparent hover:text-hcode-violet md:bottom-8 md:right-8"
          onClick={() => setOpen(true)}
        >
          Ask AI
        </button>
      ) : null}

      {open ? (
        <div
          className={`fixed bottom-5 right-4 z-50 flex max-h-[70vh] flex-col border border-hcode-border bg-white text-hcode-muted shadow-[0_12px_40px_rgba(0,0,0,0.12)] md:bottom-8 md:right-8 ${
            expanded ? "w-[min(96vw,50vw)]" : "w-[min(96vw,22rem)]"
          }`}
        >
          <div className="flex items-center justify-between border-b border-hcode-border bg-hcode-dark px-4 py-3 text-white">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Assistant</span>
            <div className="flex gap-1">
              <button
                type="button"
                className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80 hover:text-white"
                onClick={() => setExpanded((e) => !e)}
              >
                {expanded ? "Shrink" : "Expand"}
              </button>
              <button
                type="button"
                className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80 hover:text-white"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex min-h-[220px] flex-1 flex-col gap-2 overflow-y-auto px-4 py-4 text-sm leading-relaxed">
            {!introDone ? (
              <div className="flex flex-col gap-3">
                <p>{WIDGET_GREETING}</p>
                <input
                  className="hcode-input normal-case tracking-normal"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="hcode-input normal-case tracking-normal"
                  placeholder="Email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                />
                <button type="button" className="hcode-btn border-hcode-violet bg-hcode-violet hover:text-hcode-violet" onClick={onSubmitIntro}>
                  Continue
                </button>
              </div>
            ) : (
              <>
                {msgs.map((m, i) => (
                  <div
                    key={`${i}-${m.role}`}
                    className={`rounded-sm px-3 py-2 ${
                      m.role === "user" ? "ml-6 bg-hcode-gray text-right text-black" : "mr-6 border border-hcode-border bg-white"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
                <div ref={endRef} />
              </>
            )}
          </div>

          {introDone ? (
            <div className="flex gap-2 border-t border-hcode-border bg-hcode-gray p-3">
              <input
                className="hcode-input m-0 flex-1 normal-case tracking-normal"
                placeholder="Your question…"
                value={input}
                disabled={busy}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void onSend()}
              />
              <button
                type="button"
                disabled={busy}
                className="hcode-btn m-0 shrink-0 px-4 py-2 disabled:opacity-50"
                onClick={() => void onSend()}
              >
                Send
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

