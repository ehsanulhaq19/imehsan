import { notFound } from "next/navigation";
import { assetUrl } from "@/api/client";
import { fetchCaseStudyBySlug } from "@/api/case-studies";
import { BrandBack, BrandH1, BrandMain } from "@/components/brand/BrandPage";

type Row = {
  title: string;
  description?: string | null;
  externalLink?: string | null;
  attachments?: { media: { path: string } }[];
};

export default async function CaseStudyDetail({ params }: { params: { slug: string } }) {
  const c = await fetchCaseStudyBySlug<Row>(params.slug);
  if (!c) notFound();
  return (
    <BrandMain>
      <BrandBack href="/case-studies">← Case studies</BrandBack>
      <BrandH1>{c.title}</BrandH1>
      {c.description ? <p className="mt-10 whitespace-pre-wrap font-brand text-[15px] font-light leading-[1.82] text-brand-muted">{c.description}</p> : null}
      {c.externalLink ? (
        <a href={c.externalLink} className="brand-link mt-10 inline-block font-mono text-[10px] font-semibold uppercase tracking-[0.2em]" target="_blank" rel="noreferrer">
          External link →
        </a>
      ) : null}
      <ul className="mt-10 space-y-2">
        {(c.attachments ?? []).map((a) => (
          <li key={a.media.path}>
            <a href={assetUrl(a.media.path)} className="brand-link text-sm" target="_blank" rel="noreferrer">
              {a.media.path.split("/").pop()}
            </a>
          </li>
        ))}
      </ul>
    </BrandMain>
  );
}
