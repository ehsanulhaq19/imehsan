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

  return (
    <div className="mt-10 space-y-8 border border-hcode-border bg-white p-6 md:p-8">
      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-black">Share</h2>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-black">Page URL</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="break-all border border-hcode-border bg-hcode-gray px-2 py-1 text-xs">{shareUrl}</code>
          <button type="button" className="hcode-link text-[11px] font-semibold uppercase tracking-wider" onClick={() => void copy(shareUrl)}>
            Copy
          </button>
        </div>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-black">Direct media URL</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="break-all border border-hcode-border bg-hcode-gray px-2 py-1 text-xs">{fileUrl}</code>
          <button type="button" className="hcode-link text-[11px] font-semibold uppercase tracking-wider" onClick={() => void copy(fileUrl)}>
            Copy
          </button>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-semibold uppercase tracking-wider">
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="hcode-link"
          >
            LinkedIn
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="hcode-link"
          >
            X
          </a>
          <a
            href={`https://www.xing.com/spi/shares/new?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="hcode-link"
          >
            Xing
          </a>
          <a href={`https://www.instagram.com/`} target="_blank" rel="noreferrer" className="hcode-link">
            Instagram
          </a>
        </div>
      </div>

      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-black">Reactions</h2>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            className="border-2 border-black bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-transparent hover:text-black"
            onClick={() => void vote(1)}
          >
            Like
          </button>
          <button
            type="button"
            className="border-2 border-hcode-border bg-transparent px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-black hover:border-black"
            onClick={() => void vote(-1)}
          >
            Dislike
          </button>
        </div>
        {votes ? (
          <p className="mt-3 text-sm">
            Likes {votes.likes} · Dislikes {votes.dislikes}
          </p>
        ) : null}
      </div>

      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-black">Comment</h2>
        <input
          className="mt-4 hcode-input normal-case tracking-normal"
          placeholder="Name (optional)"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />
        <textarea
          className="mt-3 hcode-input normal-case tracking-normal"
          placeholder="Your comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button type="button" className="mt-3 hcode-btn border-hcode-violet bg-hcode-violet hover:text-hcode-violet" onClick={() => void postComment()}>
          Post
        </button>
      </div>

      {msg ? <p className="text-sm">{msg}</p> : null}
    </div>
  );
}

