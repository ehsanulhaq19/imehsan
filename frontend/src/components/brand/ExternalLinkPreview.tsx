import type { ReactNode } from "react";
import { classifyExternalHref, type ExternalPreviewModel } from "@/lib/external-link-preview";

function openLinkHref(url: string): string {
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return url;
  } catch {
    /* noop */
  }
  return "#";
}

function OpenInNewTab({ href, children }: { href: string; children: ReactNode }) {
  const safe = openLinkHref(href);
  return (
    <a
      href={safe}
      className="brand-link inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-sm border border-brand-outline-soft/50 bg-brand-surface-low px-2 py-0.5 font-brand-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-brand-secondary">
      {children}
    </span>
  );
}

function kindLabel(model: ExternalPreviewModel): string {
  switch (model.kind) {
    case "youtube":
      return "YouTube";
    case "vimeo":
      return "Vimeo";
    case "google-drive-file":
      return "Google Drive file";
    case "google-drive-folder":
      return "Google Drive folder";
    case "google-docs":
      return model.docKind === "document"
        ? "Google Doc"
        : model.docKind === "spreadsheets"
          ? "Google Sheet"
          : model.docKind === "presentation"
            ? "Google Slides"
            : "Google Form";
    case "pdf":
      return "PDF";
    case "office":
      return "Office document";
    case "video":
      return "Video";
    default:
      return "Link";
  }
}

const frameBase =
  "mt-4 w-full overflow-hidden rounded-sm border border-brand-outline-soft/40 bg-brand-surface-low shadow-[0_12px_40px_-24px_rgb(11_28_48_/0.35)]";

export function ExternalLinkPreview({
  href,
  heading = "Resource preview",
}: {
  href: string;
  /** Section / SR label */
  heading?: string;
}) {
  const model = classifyExternalHref(href);
  if (!model) return null;

  return (
    <section className="mt-10 border-t border-brand-outline-soft/35 pt-10" aria-labelledby="external-link-preview-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="external-link-preview-title" className="font-brand text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-fg">
          {heading}
        </h2>
        <Badge>{kindLabel(model)}</Badge>
      </div>

      {model.kind === "youtube" || model.kind === "vimeo" ? (
        <div className={`${frameBase} aspect-video min-h-[320px]`}>
          <iframe
            title={kindLabel(model)}
            src={model.embedUrl}
            className="h-full min-h-[320px] w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : null}

      {model.kind === "google-drive-file" || model.kind === "google-docs" ? (
        <div className={`${frameBase} min-h-[min(78vh,720px)]`}>
          <iframe title={kindLabel(model)} src={model.embedUrl} className="min-h-[min(78vh,720px)] h-[min(78vh,720px)] w-full" />
        </div>
      ) : null}

      {model.kind === "google-drive-folder" ? (
        <p className="mt-4 max-w-2xl font-brand text-[14px] font-light leading-relaxed text-brand-secondary">
          Drive folders cannot be embedded here. Open the folder in Google Drive to browse or download files.
        </p>
      ) : null}

      {model.kind === "pdf" ? (
        <>
          {model.embedBlocked ? (
            <p className="mt-3 max-w-2xl font-brand text-[13px] font-light leading-relaxed text-brand-muted">
              Inline preview uses a third-party viewer because the host blocks direct embedding. If it does not load, open the certificate directly.
            </p>
          ) : null}
          <div className={`${frameBase} min-h-[min(70vh,800px)]`}>
            <iframe title="PDF preview" src={model.embedUrl} className="min-h-[min(70vh,800px)] h-[min(70vh,800px)] w-full" />
          </div>
        </>
      ) : null}

      {model.kind === "office" ? (
        <>
          <p className="mt-3 max-w-2xl font-brand text-[13px] font-light leading-relaxed text-brand-muted">
            Preview uses Microsoft Office Online. The file must be publicly reachable over HTTPS.
          </p>
          <div className={`${frameBase} min-h-[min(70vh,800px)]`}>
            <iframe title="Office document preview" src={model.embedUrl} className="min-h-[min(70vh,800px)] h-[min(70vh,800px)] w-full" />
          </div>
        </>
      ) : null}

      {model.kind === "video" ? (
        <div className={`${frameBase} flex min-h-[min(72vh,480px)] items-center justify-center bg-black`}>
          <video src={model.src} controls className="max-h-[min(78vh,720px)] min-h-[240px] w-full" preload="metadata" />
        </div>
      ) : null}

      {model.kind === "generic" ? (
        <div className="mt-4 rounded-sm border border-brand-outline-soft/40 bg-brand-white/90 p-5 backdrop-blur-sm">
          <p className="font-brand-mono text-[10px] uppercase tracking-[0.18em] text-brand-secondary">{model.displayHost}</p>
          <p className="mt-2 break-all font-brand text-[13px] font-light text-brand-muted">{model.openUrl}</p>
        </div>
      ) : null}

      <p className="mt-5">
        <OpenInNewTab href={model.openUrl}>Open in new tab →</OpenInNewTab>
      </p>
    </section>
  );
}
