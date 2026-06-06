"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { assetUrl } from "@/api/client";
import { submitVlogComment, submitVlogVote } from "@/api/vlogs";
import { ScrollReveal } from "@/components/content/ScrollReveal";

export type VlogMediaItem = {
  role: string;
  order?: number;
  type?: string;
  isPublicView?: boolean;
  media: {
    path: string;
    mimeType: string;
    metadata?: Record<string, unknown>;
  };
};

type VlogCommentItem = {
  id: string;
  authorName?: string | null;
  body: string;
  createdAt: string;
};

function vid(): string {
  let k = typeof window !== "undefined" ? window.localStorage.getItem("visitor_key") : null;
  if (!k && typeof window !== "undefined") {
    k = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    window.localStorage.setItem("visitor_key", k);
  }
  return k || "";
}

function mediaDimensions(metadata?: Record<string, unknown>) {
  const w = Number(metadata?.width);
  const h = Number(metadata?.height);
  if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
    return { width: w, height: h };
  }
  return null;
}

function stableDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

function visibleEngagementMedia(items: VlogMediaItem[]) {
  return [...items]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((m) => m.isPublicView !== false && m.type !== "thumbnail");
}

function VlogMediaBlock({ item, posterSrc }: { item: VlogMediaItem; posterSrc?: string }) {
  if (!item.media.path) {
    return (
      <p className="flex min-h-[220px] items-center justify-center bg-brand-bg p-10 text-center font-brand text-[14px] text-brand-secondary">
        No media attached yet.
      </p>
    );
  }

  const src = assetUrl(item.media.path);
  const dims = mediaDimensions(item.media.metadata);
  const aspectStyle = dims ? { aspectRatio: `${dims.width} / ${dims.height}` } : undefined;
  const isVideo = item.media.mimeType.startsWith("video/");
  const isImage = item.media.mimeType.startsWith("image/");
  const isAudio = item.media.mimeType.startsWith("audio/");

  if (isVideo) {
    return (
      <div className="relative w-full bg-black/50" style={aspectStyle ?? { aspectRatio: "16 / 9" }}>
        <video
          src={src}
          controls
          className="h-full w-full object-contain"
          poster={posterSrc}
          preload="metadata"
          playsInline
        />
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="relative w-full" style={aspectStyle ?? { aspectRatio: "16 / 9" }}>
        <Image
          src={src}
          alt=""
          fill
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 72rem"
          unoptimized
        />
      </div>
    );
  }

  if (isAudio) {
    return (
      <div className="flex min-h-[120px] flex-col items-center justify-center gap-4 bg-brand-bg px-6 py-10">
        <audio src={src} controls className="w-full max-w-lg" preload="metadata" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[120px] items-center justify-center bg-brand-bg px-6 py-8">
      <a href={src} target="_blank" rel="noreferrer" className="brand-link font-brand text-[14px]">
        Open media file
      </a>
    </div>
  );
}

function VlogMediaGallery({ items }: { items: VlogMediaItem[] }) {
  const visible = visibleEngagementMedia(items);
  const poster = items.find((m) => m.type === "thumbnail" || m.role === "thumbnail" || m.role === "poster");
  const posterSrc = poster?.media.path ? assetUrl(poster.media.path) : undefined;

  if (!visible.length) {
    return (
      <p className="flex min-h-[220px] items-center justify-center bg-brand-bg p-10 text-center font-brand text-[14px] text-brand-secondary">
        No media attached yet.
      </p>
    );
  }

  return (
    <div className="divide-y divide-brand-outline-soft/30">
      {visible.map((item, i) => (
        <VlogMediaBlock key={`${item.media.path}-${i}`} item={item} posterSrc={posterSrc} />
      ))}
    </div>
  );
}

function IconThumbsUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        d="M9.719 2.97a.75.75 0 0 1 1.06.31l.531 1.062a6.75 6.75 0 0 1 .705 3.02v.429h4.243a2.25 2.25 0 0 1 2.214 2.654l-1.245 7.11a2.25 2.25 0 0 1-2.215 1.86H7.5A2.25 2.25 0 0 1 5.25 17.17V10.5A2.25 2.25 0 0 1 6 8.833l3.719-5.553a.75.75 0 0 1 .31-.31ZM3.75 10.5a.75.75 0 0 0-.75.75v6a.75.75 0 0 0 .75.75h.75a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-.75-.75h-.75Z"
      />
    </svg>
  );
}

function IconThumbsDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        d="M10.281 17.03a.75.75 0 0 1-1.06-.31L8.69 15.658a6.75 6.75 0 0 1-.705-3.02v-.429H3.742a2.25 2.25 0 0 1-2.214-2.654l1.245-7.11a2.25 2.25 0 0 1 2.215-1.86H12.5a2.25 2.25 0 0 1 2.25 2.245V9.5A2.25 2.25 0 0 1 14 11.167l-3.719 5.553a.75.75 0 0 1-.31.31ZM16.25 9.5a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-.75-.75h-.75a.75.75 0 0 0-.75.75v6a.75.75 0 0 0 .75.75h.75Z"
      />
    </svg>
  );
}

function IconShare({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" />
    </svg>
  );
}

const fieldCls =
  "mt-4 w-full border border-brand-outline-soft/55 bg-brand-white px-3 py-2.5 font-brand text-[13px] font-normal normal-case tracking-normal text-brand-fg outline-none placeholder:text-brand-muted/50 focus:border-brand-tertiary/65";

const h2Cls = "font-brand text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-fg";

const iconBtnCls =
  "inline-flex items-center justify-center rounded-sm border border-brand-outline-soft/60 bg-transparent p-2.5 text-brand-fg transition-colors hover:border-brand-tertiary/50 hover:bg-brand-surface-low/80";

const iconBtnActiveCls =
  "inline-flex items-center justify-center rounded-sm border border-transparent bg-brand-secondary p-2.5 text-white transition-opacity hover:opacity-90";

export function VlogEngagement({
  slug,
  shareUrl,
  fileUrl,
  mediaItems = [],
  initialVotes,
  initialComments = [],
}: {
  slug: string;
  shareUrl: string;
  fileUrl: string;
  mediaItems?: VlogMediaItem[];
  initialVotes?: { likes: number; dislikes: number };
  initialComments?: VlogCommentItem[];
}) {
  const visitorKey = useMemo(() => vid(), []);
  const [comment, setComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [votes, setVotes] = useState<{ likes: number; dislikes: number } | null>(initialVotes ?? null);
  const [comments, setComments] = useState<VlogCommentItem[]>(initialComments);
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

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
      const now = new Date().toISOString();
      const posted: VlogCommentItem = {
        id: `new-${now}`,
        authorName: authorName || null,
        body: comment,
        createdAt: now,
      };
      setComments((prev) => [posted, ...prev]);
      setComment("");
      setAuthorName("");
      setMsg("Comment posted.");
    } else setMsg("Comment failed.");
  };

  const copy = async (url: string, label: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setMsg(`${label} copied.`);
      setShareOpen(false);
    } catch {
      setMsg(url);
    }
  };

  useEffect(() => {
    if (!shareOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShareOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [shareOpen]);

  const showMediaLink = fileUrl.trim() !== "" && fileUrl !== shareUrl;

  return (
    <div className="mt-10 space-y-10">
      <ScrollReveal>
        <div className="overflow-hidden rounded-[1.85rem] border border-brand-outline-soft/30 bg-brand-fg/[0.04] shadow-[0_42px_90px_-40px_rgb(11_28_48_/0.82)] ring-8 ring-brand-bg/55">
          <VlogMediaGallery items={mediaItems} />
        </div>
      </ScrollReveal>

      <div className="space-y-10 rounded-sm border border-brand-outline-soft/40 bg-brand-white/92 p-6 shadow-[0_20px_50px_-32px_rgb(11_28_48_/0.25)] backdrop-blur-sm md:p-9">
        <div>
          <h2 className={h2Cls}>Reactions</h2>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={`${iconBtnActiveCls} gap-2 px-4`}
              aria-label="Like"
              title="Like"
              onClick={() => void vote(1)}
            >
              <IconThumbsUp className="h-5 w-5" />
              <span className="font-brand text-[10px] font-semibold uppercase tracking-[0.2em]">{votes?.likes ?? 0}</span>
            </button>
            <button
              type="button"
              className={`${iconBtnCls} gap-2 px-4`}
              aria-label="Dislike"
              title="Dislike"
              onClick={() => void vote(-1)}
            >
              <IconThumbsDown className="h-5 w-5" />
              <span className="font-brand text-[10px] font-semibold uppercase tracking-[0.2em]">{votes?.dislikes ?? 0}</span>
            </button>

            <div className="relative" ref={shareRef}>
              <button
                type="button"
                className={`${iconBtnCls} gap-2 px-4`}
                aria-expanded={shareOpen}
                aria-haspopup="true"
                onClick={() => setShareOpen((o) => !o)}
              >
                <IconShare className="h-5 w-5" />
                <span className="font-brand text-[10px] font-semibold uppercase tracking-[0.2em]">Share</span>
              </button>
              {shareOpen ? (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-20 mt-2 min-w-[220px] rounded-sm border border-brand-outline-soft/50 bg-brand-white py-2 shadow-[0_16px_40px_-20px_rgb(11_28_48_/0.35)]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-4 py-2.5 text-left font-brand-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-fg hover:bg-brand-surface-low/80"
                    onClick={() => void copy(shareUrl, "Page link")}
                  >
                    Copy page link
                  </button>
                  {showMediaLink ? (
                    <button
                      type="button"
                      role="menuitem"
                      className="block w-full px-4 py-2.5 text-left font-brand-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-fg hover:bg-brand-surface-low/80"
                      onClick={() => void copy(fileUrl, "Media link")}
                    >
                      Copy media link
                    </button>
                  ) : null}
                  <div className="my-2 border-t border-brand-outline-soft/40" />
                  <a
                    role="menuitem"
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block px-4 py-2.5 font-brand-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-fg hover:bg-brand-surface-low/80"
                    onClick={() => setShareOpen(false)}
                  >
                    LinkedIn
                  </a>
                  <a
                    role="menuitem"
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block px-4 py-2.5 font-brand-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-fg hover:bg-brand-surface-low/80"
                    onClick={() => setShareOpen(false)}
                  >
                    X
                  </a>
                  <a
                    role="menuitem"
                    href={`https://www.xing.com/spi/shares/new?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block px-4 py-2.5 font-brand-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-fg hover:bg-brand-surface-low/80"
                    onClick={() => setShareOpen(false)}
                  >
                    Xing
                  </a>
                  <a
                    role="menuitem"
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="block px-4 py-2.5 font-brand-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-fg hover:bg-brand-surface-low/80"
                    onClick={() => setShareOpen(false)}
                  >
                    Instagram
                  </a>
                </div>
              ) : null}
            </div>
          </div>
          {votes ? (
            <p className="mt-4 font-brand text-[14px] font-light text-brand-secondary">
              Likes {votes.likes} · Dislikes {votes.dislikes}
            </p>
          ) : null}
        </div>

        <div>
          <h2 className={h2Cls}>User comments</h2>
          <div className="mt-5 space-y-3">
            {comments.length === 0 ? (
              <p className="font-brand text-[14px] text-brand-secondary">No comments yet.</p>
            ) : (
              comments.map((item) => (
                <article key={item.id} className="rounded-sm border border-brand-outline-soft/50 bg-brand-white px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-brand text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-secondary">
                      {item.authorName?.trim() || "Anonymous"}
                    </p>
                    <p className="font-brand text-[12px] text-brand-muted">
                      {stableDateTime(item.createdAt)}
                    </p>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap font-brand text-[14px] text-brand-fg">{item.body}</p>
                </article>
              ))
            )}
          </div>
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
    </div>
  );
}
