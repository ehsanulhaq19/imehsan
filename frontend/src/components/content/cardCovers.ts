import type { CertificationListRow } from "@/api/certifications";

export type CaseStudyCardRow = {
  coverImageUrl?: string | null;
  attachments?: { media: { path: string; mimeType: string } }[];
};

export function coverForCaseStudy(c: CaseStudyCardRow): string | undefined {
  if (c.coverImageUrl?.trim()) return c.coverImageUrl.trim();
  const imgs = (c.attachments ?? []).filter((a) => a.media.mimeType.startsWith("image"));
  return imgs[0]?.media.path;
}

export function coverForProject(p: {
  coverImageUrl?: string | null;
  projectMedia?: { role: string; media: { path: string; mimeType: string } }[];
}): string | undefined {
  if (p.coverImageUrl?.trim()) return p.coverImageUrl.trim();
  const pm = p.projectMedia ?? [];
  const cover = pm.find((m) => m.role === "cover" || m.role === "thumbnail");
  const img = pm.find((m) => m.media.mimeType.startsWith("image"));
  const vid = pm.find((m) => m.media.mimeType.startsWith("video"));
  return (cover ?? img ?? vid)?.media.path;
}

export function coverForCertification(c: CertificationListRow): string | undefined {
  const v = c.coverImageUrl?.trim() || c.thumbnailUrl?.trim();
  return v || undefined;
}

export function coverForVlog(v: {
  mediaItems?: {
    role: string;
    order?: number;
    type?: string;
    isPublicView?: boolean;
    media: { path: string; mimeType: string };
  }[];
}): { image?: string; video?: string } {
  const items = [...(v.mediaItems ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const thumb = items.find((m) => m.type === "thumbnail");
  const firstPublic = items.find((m) => m.isPublicView !== false);
  const video = items.find((m) => m.role === "video" || m.media.mimeType.startsWith("video/"));
  return {
    video: video?.media.path,
    image: thumb?.media.path ?? firstPublic?.media.path,
  };
}

export function coverForTestimonial(t: {
  coverImageUrl?: string | null;
  images?: { media: { path: string; mimeType: string } }[];
}): string | undefined {
  if (t.coverImageUrl?.trim()) return t.coverImageUrl.trim();
  const img = (t.images ?? []).find((i) => i.media.mimeType.startsWith("image"));
  return img?.media.path;
}
