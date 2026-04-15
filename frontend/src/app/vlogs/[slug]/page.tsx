import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { assetUrl } from "@/api/client";
import { fetchVlogBySlug } from "@/api/vlogs";
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
    <div className="mx-auto max-w-3xl px-4 py-14 text-hcode-muted md:py-20">
      <Link href="/vlogs" className="hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]">
        ← Vlogs
      </Link>
      <h1 className="font-display mt-8 text-2xl uppercase text-black md:text-3xl">{v.heading}</h1>
      {v.description ? <p className="mt-4 leading-relaxed">{v.description}</p> : null}
      <div className="mt-8 overflow-hidden border border-hcode-border bg-black">
        {video ? (
          <video src={assetUrl(video.media.path)} controls className="w-full" poster={thumb ? assetUrl(thumb.media.path) : undefined} />
        ) : thumb ? (
          <Image
            src={assetUrl(thumb.media.path)}
            alt=""
            width={1280}
            height={720}
            className="w-full"
            unoptimized
          />
        ) : (
          <p className="p-8 text-center text-sm text-white/70">No video attached yet.</p>
        )}
      </div>

      <VlogEngagement slug={params.slug} shareUrl={v.shareUrl} fileUrl={v.fileUrl} initialVotes={v.voteSummary} />
    </div>
  );
}

