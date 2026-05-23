"use client";

import { useCallback, useMemo, useState } from "react";
import { submitVlogComment, submitVlogVote } from "@/api/vlogs";

function vid(): string {
  let k = typeof window !== "undefined" ? window.localStorage.getItem("visitor_key") : null;
  if (!k && typeof window !== "undefined") {
    k = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    window.localStorage.setItem("visitor_key", k);
  }
  return k || "";
}

const fieldCls =
  "mt-4 w-full border border-brand-outline-soft/55 bg-brand-white px-3 py-2.5 font-brand text-[13px] font-normal normal-case tracking-normal text-brand-fg outline-none placeholder:text-brand-muted/50 focus:border-brand-tertiary/65";

const h2Cls = "font-brand text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-fg";

export function VlogEngagement({
  slug,
  shareUrl,
  fileUrl,
  initialVotes,
}: {
  slug: string;
  shareUrl: string;
  fileUrl: string;
  initialVotes?: { likes: number; dislikes: number };
}) {
  const visitorKey = useMemo(() => vid(), []);
  const [comment, setComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [votes, setVotes] = useState<{ likes: number; dislikes: number } | null>(initialVotes ?? null);

  const vote = useCallback(
    async (value: number) => {
      setMsg(null);
      const res = await submitVlogVote(slug, { visitorKey, value });
      const data = res.ok ? await res.json() : null;
      if (data) setVotes(data);
      else setMsg("Could not record vote.");
    },
    [slug, visitorKey],
  );

  const postComment = async () => {
    setMsg(null);
    const res = await submitVlogComment(slug, {
      body: comment,
      authorName: authorName || undefined,
    });
    if (res.ok) {
      setComment("");
      setMsg("Comment posted.");
    } else setMsg("Comment failed.");
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setMsg("Link copied.");
    } catch {
      setMsg(url);
    }
  };

  const codeCls =
    "break-all rounded-sm border border-brand-outline-soft/40 bg-brand-surface-low px-2.5 py-1.5 font-brand-mono text-[11px] text-brand-muted";

  return (
    <div className="mt-10 space-y-10 rounded-sm border border-brand-outline-soft/40 bg-brand-white/92 p-6 shadow-[0_20px_50px_-32px_rgb(11_28_48_/0.25)] backdrop-blur-sm md:p-9">
      <div>
        <h2 className={h2Cls}>Share</h2>
        <p className="mt-6 font-brand-mono text-[10px] uppercase tracking-[0.2em] text-brand-secondary">Page URL</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className={codeCls}>{shareUrl}</code>
          <button type="button" className="brand-link font-brand-mono text-[10px] font-semibold uppercase tracking-[0.2em]" onClick={() => void copy(shareUrl)}>
            Copy
          </button>
        </div>
        <p className="mt-5 font-brand-mono text-[10px] uppercase tracking-[0.2em] text-brand-secondary">Direct media URL</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className={codeCls}>{fileUrl}</code>
          <button type="button" className="brand-link font-brand-mono text-[10px] font-semibold uppercase tracking-[0.2em]" onClick={() => void copy(fileUrl)}>
            Copy
          </button>
        </div>
        <div className="mt-7 flex flex-wrap gap-x-7 gap-y-2 font-brand-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="brand-link">
            LinkedIn
          </a>
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="brand-link">
            X
          </a>
          <a href={`https://www.xing.com/spi/shares/new?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="brand-link">
            Xing
          </a>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="brand-link">
            Instagram
          </a>
        </div>
      </div>

      <div>
        <h2 className={h2Cls}>Reactions</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-sm border border-transparent bg-brand-secondary px-5 py-2.5 font-brand text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90"
            onClick={() => void vote(1)}
          >
            Like
          </button>
          <button
            type="button"
            className="rounded-sm border border-brand-outline-soft/60 bg-transparent px-5 py-2.5 font-brand text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-fg transition-colors hover:border-brand-tertiary/50"
            onClick={() => void vote(-1)}
          >
            Dislike
          </button>
        </div>
        {votes ? <p className="mt-4 font-brand text-[14px] font-light text-brand-secondary">Likes {votes.likes} · Dislikes {votes.dislikes}</p> : null}
      </div>

      <div>
        <h2 className={h2Cls}>Comment</h2>
        <input className={`${fieldCls} mt-6`} placeholder="Name (optional)" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
        <textarea className={`${fieldCls} mt-4 resize-y leading-relaxed`} placeholder="Your comment" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
        <button
          type="button"
          className="mt-4 rounded-sm bg-brand-secondary px-6 py-2.5 font-brand text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90"
          onClick={() => void postComment()}
        >
          Post
        </button>
      </div>

      {msg ? <p className="font-brand text-[14px] font-light text-brand-secondary">{msg}</p> : null}
    </div>
  );
}
