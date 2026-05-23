import Image from "next/image";
import { notFound } from "next/navigation";
import { assetUrl } from "@/api/client";
import { fetchVlogBySlug } from "@/api/vlogs";
import { BrandBack, BrandH1, BrandMain } from "@/components/brand/BrandPage";
import { VlogEngagement } from "@/components/VlogEngagement";

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
  return (
    <BrandMain>
      <BrandBack href="/vlogs">← Vlogs</BrandBack>
      <BrandH1>{v.heading}</BrandH1>
      {v.description ? <p className="mt-6 font-brand text-[15px] font-light leading-[1.8] text-brand-secondary">{v.description}</p> : null}
      <div className="mt-10 overflow-hidden border border-brand-outline-soft/35 bg-brand-fg shadow-[0_26px_60px_-30px_rgb(11_28_48_/0.45)]">
        {video ? (
          <video src={assetUrl(video.media.path)} controls className="w-full" poster={thumb ? assetUrl(thumb.media.path) : undefined} />
        ) : thumb ? (
          <Image src={assetUrl(thumb.media.path)} alt="" width={1280} height={720} className="w-full" unoptimized />
        ) : (
          <p className="bg-brand-bg p-10 text-center font-brand text-[14px] text-brand-secondary">No video attached yet.</p>
        )}
      </div>

      <VlogEngagement slug={params.slug} shareUrl={v.shareUrl} fileUrl={v.fileUrl} initialVotes={v.voteSummary} />
    </BrandMain>
  );
}
