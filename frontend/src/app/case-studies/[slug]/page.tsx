import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { assetUrl } from "@/api/client";
import { fetchCaseStudyBySlug } from "@/api/case-studies";
import { BrandBack, BrandH1, BrandMain } from "@/components/brand/BrandPage";
import { ScrollReveal } from "@/components/content/ScrollReveal";
import type { CaseStudyCardRow } from "@/components/content/cardCovers";
import { ExternalLinkPreview } from "@/components/brand/ExternalLinkPreview";
import { SafeRichText } from "@/components/SafeRichText";
import { stripHtmlToPlainText } from "@/lib/html-plain";

type Attachment = {
  id?: string;
  media: { path: string; mimeType: string };
};

type Row = CaseStudyCardRow & {
  title: string;
  description?: string | null;
  externalLink?: string | null;
  attachments?: Attachment[];
};

export default async function CaseStudyDetail({ params }: { params: { slug: string } }) {
  const c = await fetchCaseStudyBySlug<Row>(params.slug);
  if (!c) notFound();
  const attachments = c.attachments ?? [];

  return (
    <BrandMain className="max-w-6xl">
      <BrandBack href="/case-studies">← Case studies</BrandBack>
      {c.coverImageUrl?.trim() ? (
        <div className="relative mt-8 aspect-[21/9] w-full overflow-hidden border border-brand-outline-soft/40">
          <Image
            src={assetUrl(c.coverImageUrl)}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 72rem"
            unoptimized
            priority
          />
        </div>
      ) : null}
      <BrandH1>{c.title}</BrandH1>
      {stripHtmlToPlainText(c.description) ? <SafeRichText html={c.description ?? ""} className="mt-10" /> : null}
      {c.externalLink ? <ExternalLinkPreview href={c.externalLink} heading="External link preview" /> : null}

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {attachments.map((a, i) => {
          const att = a as Attachment;
          const key = att.id ?? att.media.path;
          const href = assetUrl(a.media.path);
          const isVideo = a.media.mimeType.startsWith("video");
          const isImage = a.media.mimeType.startsWith("image");
          return (
            <ScrollReveal key={key} delay={Math.min(i * 0.06, 0.4)}>
              <div className="flex h-full flex-col overflow-hidden border-2 border-dashed border-brand-outline-soft/55 bg-brand-surface-low/35">
                <div className="relative aspect-[16/11] bg-brand-fg/[0.04]">
                  {isVideo ? (
                    <video src={href} controls preload="metadata" className="h-full w-full object-cover" />
                  ) : isImage ? (
                    <Link href={href} target="_blank" rel="noreferrer" className="relative block h-full w-full">
                      <Image src={href} alt="" fill className="object-cover" sizes="(max-width:640px) 100vw, 50vw" unoptimized />
                    </Link>
                  ) : (
                    <div className="flex h-full items-center justify-center p-6">
                      <Link href={href} className="brand-link break-all text-center text-sm" target="_blank" rel="noreferrer">
                        {a.media.path.split("/").pop()}
                      </Link>
                    </div>
                  )}
                </div>
                <div className="border-t border-brand-outline-soft/35 p-4">
                  <Link href={href} className="brand-link font-mono text-[11px] uppercase tracking-[0.12em]" target="_blank" rel="noreferrer">
                    Open file
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
      {!attachments.length ? <p className="mt-10 font-brand text-[14px] text-brand-secondary"></p> : null}
    </BrandMain>
  );
}
