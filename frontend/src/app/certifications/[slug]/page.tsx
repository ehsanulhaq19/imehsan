import Image from "next/image";
import { notFound } from "next/navigation";
import { assetUrl } from "@/api/client";
import { fetchCertificationBySlug } from "@/api/certifications";
import type { CertificationListRow } from "@/api/certifications";
import { BrandBack, BrandH1, BrandMain } from "@/components/brand/BrandPage";
import { ScrollReveal } from "@/components/content/ScrollReveal";
import { coverForCertification } from "@/components/content/cardCovers";
import { ExternalLinkPreview } from "@/components/brand/ExternalLinkPreview";
import { SafeRichText } from "@/components/SafeRichText";
import { stripHtmlToPlainText } from "@/lib/html-plain";

type Row = {
  heading: string;
  detail?: string | null;
  linkUrl?: string | null;
  thumbnailUrl?: string | null;
  coverImageUrl?: string | null;
};

export default async function CertificationDetail({ params }: { params: { slug: string } }) {
  const c = await fetchCertificationBySlug<Row>(params.slug);
  if (!c) notFound();
  const cover = coverForCertification(c as CertificationListRow);

  return (
    <BrandMain className="max-w-6xl">
      <BrandBack href="/certifications">← Certifications</BrandBack>
      <ScrollReveal>
        <article className="mt-8 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-brand-surface-low via-brand-bg/80 to-brand-surface-low/70 p-[1px] shadow-[0_32px_72px_-42px_rgb(11_28_48_/0.8)]">
          <div className="rounded-[calc(1.5rem-1px)] bg-brand-bg/85 p-8 md:p-11">
            <div className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)] md:items-start">
              <ScrollReveal delay={0.08}>
                <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl ring-1 ring-brand-outline-soft/40">
                  {cover ? (
                    <Image
                      src={assetUrl(cover)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 40rem"
                      unoptimized
                      priority
                    />
                  ) : (
                    <div className="flex h-full min-h-[200px] items-center justify-center font-mono text-[10px] uppercase tracking-[0.2em] text-brand-secondary">
                      Certificate
                    </div>
                  )}
                </div>
              </ScrollReveal>
              <div>
                <BrandH1>{c.heading}</BrandH1>
                {stripHtmlToPlainText(c.detail) ? <SafeRichText html={c.detail ?? ""} className="mt-8" /> : null}
              </div>
            </div>
          </div>
        </article>
      </ScrollReveal>
      {c.linkUrl ? <ExternalLinkPreview href={c.linkUrl} heading="Credential link preview" /> : null}
    </BrandMain>
  );
}
