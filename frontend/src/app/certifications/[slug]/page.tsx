import Image from "next/image";
import { notFound } from "next/navigation";
import { assetUrl } from "@/api/client";
import { fetchCertificationBySlug } from "@/api/certifications";
import { BrandBack, BrandH1, BrandMain } from "@/components/brand/BrandPage";

type Row = {
  heading: string;
  detail?: string | null;
  linkUrl?: string | null;
  thumbnailUrl?: string | null;
};

export default async function CertificationDetail({ params }: { params: { slug: string } }) {
  const c = await fetchCertificationBySlug<Row>(params.slug);
  if (!c) notFound();

  return (
    <BrandMain>
      <BrandBack href="/certifications">← Certifications</BrandBack>
      <div className="relative mt-10 aspect-[16/10] w-full overflow-hidden border border-brand-outline-soft/40 bg-brand-surface-low">
        {c.thumbnailUrl ? (
          <Image
            src={assetUrl(c.thumbnailUrl)}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 48rem"
            unoptimized
            priority
          />
        ) : null}
      </div>
      <BrandH1>{c.heading}</BrandH1>
      {c.detail ? <p className="mt-10 whitespace-pre-wrap font-brand text-[15px] font-light leading-[1.82] text-brand-muted">{c.detail}</p> : null}
      {c.linkUrl ? (
        <a href={c.linkUrl} className="brand-link mt-10 inline-block font-mono text-[10px] font-semibold uppercase tracking-[0.2em]" target="_blank" rel="noreferrer">
          Credential link →
        </a>
      ) : null}
    </BrandMain>
  );
}
