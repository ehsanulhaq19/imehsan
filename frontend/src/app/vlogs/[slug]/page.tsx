import { notFound } from "next/navigation";
import { fetchVlogBySlug } from "@/api/vlogs";
import { BrandBack, BrandH1, BrandMain } from "@/components/brand/BrandPage";
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
  comments?: { id: string; authorName?: string | null; body: string; createdAt: string }[];
  mediaItems?: { role: string; media: { path: string; mimeType: string; metadata?: Record<string, unknown> } }[];
};

export default async function VlogDetail({ params }: { params: { slug: string } }) {
  const v = await fetchVlogBySlug<Detail>(params.slug);
  if (!v) notFound();

  return (
    <BrandMain className="max-w-6xl">
      <BrandBack href="/vlogs">← Vlogs</BrandBack>
      <BrandH1>{v.heading}</BrandH1>
      {stripHtmlToPlainText(v.description) ? <SafeRichText html={v.description ?? ""} className="mt-6" /> : null}

      {isCrossOriginUrl(v.shareUrl, v.fileUrl) ? (
        <ExternalLinkPreview href={v.fileUrl} heading="External file link preview" />
      ) : null}

      <VlogEngagement
        slug={params.slug}
        shareUrl={v.shareUrl}
        fileUrl={v.fileUrl}
        mediaItems={v.mediaItems ?? []}
        initialVotes={v.voteSummary}
        initialComments={v.comments ?? []}
      />
    </BrandMain>
  );
}
