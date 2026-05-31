/**
 * Classifies external HTTPS links for embedded previews (drive, docs, pdf, office, video).
 */

export type GoogleDocKind = "document" | "spreadsheets" | "presentation" | "forms";

export type ExternalPreviewModel =
  | { kind: "youtube"; embedUrl: string; openUrl: string }
  | { kind: "vimeo"; embedUrl: string; openUrl: string }
  | { kind: "google-drive-file"; embedUrl: string; openUrl: string }
  | { kind: "google-drive-folder"; openUrl: string }
  | { kind: "google-docs"; embedUrl: string; openUrl: string; docKind: GoogleDocKind }
  | { kind: "pdf"; openUrl: string; embedStrategy: "direct"; embedUrl: string; embedBlocked: boolean }
  | { kind: "office"; openUrl: string; embedUrl: string }
  | { kind: "video"; src: string; openUrl: string }
  | { kind: "generic"; openUrl: string; hostname: string; displayHost: string };

const VIDEO_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?|#|$)/i;
const PDF_EXT = /\.pdf(\?|#|$)/i;
const OFFICE_EXT = /\.(docx|doc|pptx|ppt|xlsx|xls)(\?|#|$)/i;

function isDatacampStatementUrl(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  if (host !== "datacamp.com" && host !== "www.datacamp.com") return false;
  return /^\/statement-of-accomplishment(?:\/|$)/i.test(url.pathname);
}

/** True when the URL serves (or is intended to serve) PDF bytes without a `.pdf` path suffix. */
function isPdfServingUrl(url: URL): boolean {
  const pathname = url.pathname;
  const lastSegment = pathname.split("/").pop() ?? "";

  if (PDF_EXT.test(lastSegment) || pathname.toLowerCase().endsWith(".pdf")) {
    return true;
  }

  const format = url.searchParams.get("format")?.toLowerCase();
  if (format === "pdf") return true;

  const type = url.searchParams.get("type")?.toLowerCase();
  if (type === "pdf" || type === "application/pdf") return true;

  const mime = url.searchParams.get("mime")?.toLowerCase();
  if (mime === "application/pdf") return true;

  if (url.searchParams.get("download")?.toLowerCase() === "pdf") return true;

  // DataCamp certificates: `?raw=1` returns the PDF file.
  if (isDatacampStatementUrl(url)) {
    const raw = url.searchParams.get("raw");
    if (raw === "1" || raw === "true") return true;
  }

  for (const value of Array.from(url.searchParams.values())) {
    if (PDF_EXT.test(value) || value.toLowerCase().endsWith(".pdf")) return true;
  }

  return false;
}

/** Hosts that block cross-origin iframe/object embedding for credential PDFs. */
function pdfEmbeddingBlocked(url: URL): boolean {
  return isDatacampStatementUrl(url);
}

/** Office Online viewer — requires a public HTTPS URL. */
const OFFICE_VIEWER = "https://view.officeapps.live.com/op/embed.aspx";

/** Fallback viewer for PDF hosts that block cross-origin iframe embedding. */
const GOOGLE_PDF_VIEWER = "https://docs.google.com/gview";

function googleDriveFileId(url: URL): string | null {
  const fm = url.pathname.match(/\/file\/d\/([^/]+)/);
  if (fm?.[1]) return fm[1];
  if (url.pathname.includes("/open") || url.pathname === "/drive/folders/open") {
    const id = url.searchParams.get("id");
    if (id) return id;
  }
  if (url.pathname.includes("/uc")) {
    const id = url.searchParams.get("id");
    if (id) return id;
  }
  return null;
}

function googleDocsEmbed(url: URL): { id: string; docKind: GoogleDocKind; embedUrl: string } | null {
  if (url.hostname !== "docs.google.com") return null;

  const formsE = url.pathname.match(/^\/forms\/d\/e\/([a-zA-Z0-9_-]+)/);
  if (formsE?.[1]) {
    return {
      id: formsE[1],
      docKind: "forms",
      embedUrl: `https://docs.google.com/forms/d/e/${formsE[1]}/viewform?embedded=true`,
    };
  }

  const m = url.pathname.match(/^\/(document|spreadsheets|presentation|forms)\/d\/([a-zA-Z0-9_-]+)/);
  if (!m?.[1] || !m[2]) return null;
  const docKind = m[1] as GoogleDocKind;
  if (docKind !== "document" && docKind !== "spreadsheets" && docKind !== "presentation" && docKind !== "forms") return null;
  return {
    id: m[2],
    docKind,
    embedUrl: `https://docs.google.com/${docKind}/d/${m[2]}/preview`,
  };
}

export function classifyExternalHref(raw: string): ExternalPreviewModel | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const openUrl = url.toString();

  const yt = youtubeVideoId(url);
  if (yt) {
    return {
      kind: "youtube",
      openUrl,
      embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt)}?rel=0`,
    };
  }

  const vm = vimeoVideoId(url);
  if (vm) {
    return {
      kind: "vimeo",
      openUrl,
      embedUrl: `https://player.vimeo.com/video/${encodeURIComponent(vm)}`,
    };
  }

  const gdoc = googleDocsEmbed(url);
  if (gdoc) {
    return {
      kind: "google-docs",
      openUrl,
      docKind: gdoc.docKind,
      embedUrl: gdoc.embedUrl,
    };
  }

  if (url.hostname.includes("drive.google.com") || url.hostname === "drive.usercontent.google.com") {
    if (/\/folders\//.test(url.pathname)) {
      return { kind: "google-drive-folder", openUrl };
    }
    const gid = googleDriveFileId(url);
    if (gid) {
      return {
        kind: "google-drive-file",
        openUrl,
        embedUrl: `https://drive.google.com/file/d/${gid}/preview`,
      };
    }
  }

  const pathname = url.pathname.split("/").pop() ?? "";
  const pathOrName = pathname + url.search;

  if (isPdfServingUrl(url)) {
    const https = url.protocol === "https:" ? openUrl : null;
    if (!https) return { kind: "generic", openUrl, hostname: url.hostname, displayHost: displayHostname(url.hostname) };
    const embedBlocked = pdfEmbeddingBlocked(url);
    return {
      kind: "pdf",
      openUrl,
      embedStrategy: "direct",
      embedUrl: embedBlocked
        ? `${GOOGLE_PDF_VIEWER}?url=${encodeURIComponent(https)}&embedded=true`
        : https,
      embedBlocked,
    };
  }

  if (OFFICE_EXT.test(pathname)) {
    const https = url.protocol === "https:" ? openUrl : null;
    if (!https) return { kind: "generic", openUrl, hostname: url.hostname, displayHost: displayHostname(url.hostname) };
    const embedUrl = `${OFFICE_VIEWER}?src=${encodeURIComponent(https)}`;
    return { kind: "office", openUrl, embedUrl };
  }

  if (VIDEO_EXT.test(pathOrName)) {
    return { kind: "video", src: openUrl, openUrl };
  }

  return {
    kind: "generic",
    openUrl,
    hostname: url.hostname,
    displayHost: displayHostname(url.hostname),
  };
}

export function displayHostname(hostname: string): string {
  return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
}

/** True when `candidate` is a valid http(s) URL on a different origin than `baseUrl`. */
export function isCrossOriginUrl(baseUrl: string, candidate: string): boolean {
  try {
    const b = new URL(baseUrl);
    const c = new URL(candidate);
    return c.protocol === "http:" || c.protocol === "https:" ? b.origin !== c.origin : false;
  } catch {
    return false;
  }
}

function youtubeVideoId(url: URL): string | null {
  if (url.hostname === "youtu.be") {
    const id = url.pathname.replace(/^\//, "").split("/")[0];
    return id && id.length >= 6 ? id : null;
  }
  if (url.hostname.includes("youtube.com")) {
    const v = url.searchParams.get("v");
    if (v) return v;
    const embed = url.pathname.match(/\/embed\/([^/?]+)/);
    if (embed?.[1]) return embed[1];
    const shorts = url.pathname.match(/\/shorts\/([^/?]+)/);
    if (shorts?.[1]) return shorts[1];
    const live = url.pathname.match(/\/live\/([^/?]+)/);
    if (live?.[1]) return live[1];
  }
  return null;
}

function vimeoVideoId(url: URL): string | null {
  if (!url.hostname.includes("vimeo.com")) return null;
  const videoPath = url.pathname.match(/\/video\/(\d+)/);
  if (videoPath?.[1]) return videoPath[1];
  const slashId = url.pathname.match(/^\/(\d+)(?:\/|$)/);
  if (slashId?.[1]) return slashId[1];
  const nested = url.pathname.match(/\/(?:channels\/[^/]+\/|groups\/[^/]+\/)videos\/(\d+)/);
  return nested?.[1] ?? null;
}
