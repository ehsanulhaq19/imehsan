import Image from "next/image";
import { notFound } from "next/navigation";
import { assetUrl } from "@/api/client";
import { fetchVlogBySlug } from "@/api/vlogs";
import { BrandBack, BrandH1, BrandMain } from "@/components/brand/BrandPage";
import { ScrollReveal } from "@/components/content/ScrollReveal";
import { ExternalLinkPreview } from "@/components/brand/ExternalLinkPreview";
import { SafeRichText } from "@/components/SafeRichText";
import { VlogEngagement } from "@/components/VlogEngagement";
import { isCrossOriginUrl } from "@/lib/external-link-preview";
import { stripHtmlToPlainText } from "@/lib/html-plain";

type Detail = {
  heading: string;
  description?: string | null;
  shareUrl: string;
  fileUrl: string;
  voteSummary?: { likes: number; dislikes: number };
  mediaItems?: { role: string; media: { path: string; mimeType: string } }[];
};

export default async function VlogDetail({ params }: { params: { slug: string } }) {
  const v = await fetchVlogBySlug<Detail>(params.slug);
  if (!v) notFound();
  const video = v.mediaItems?.find((m) => m.role === "video");
  const thumb = v.mediaItems?.find((m) => m.role === "thumbnail");
  const poster = thumb?.media.path ? assetUrl(thumb.media.path) : undefined;
  const videoSrc = video?.media.path ? assetUrl(video.media.path) : undefined;

  return (
    <BrandMain className="max-w-6xl">
      <BrandBack href="/vlogs">← Vlogs</BrandBack>
      <BrandH1>{v.heading}</BrandH1>
      {stripHtmlToPlainText(v.description) ? <SafeRichText html={v.description ?? ""} className="mt-6" /> : null}

      {isCrossOriginUrl(v.shareUrl, v.fileUrl) ? (
        <ExternalLinkPreview href={v.fileUrl} heading="External file link preview" />
      ) : null}

      <ScrollReveal>
        <div className="mt-12 overflow-hidden rounded-[1.85rem] border border-brand-outline-soft/30 bg-brand-fg/[0.04] shadow-[0_42px_90px_-40px_rgb(11_28_48_/0.82)] ring-8 ring-brand-bg/55">
          <div className="relative aspect-video bg-black/50">
            {videoSrc ? (
              <video
                src={videoSrc}
                controls
                className="h-full w-full object-cover"
                poster={poster}
                preload="metadata"
                playsInline
              />
            ) : thumb ? (
              <Image
                src={assetUrl(thumb.media.path)}
                alt=""
                width={1280}
                height={720}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <p className="flex min-h-[220px] items-center justify-center bg-brand-bg p-10 text-center font-brand text-[14px] text-brand-secondary">
                No video attached yet.
              </p>
            )}
          </div>
        </div>
      </ScrollReveal>

      <VlogEngagement slug={params.slug} shareUrl={v.shareUrl} fileUrl={v.fileUrl} initialVotes={v.voteSummary} />
    </BrandMain>
  );
}
