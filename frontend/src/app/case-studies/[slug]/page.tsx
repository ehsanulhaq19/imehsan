import Link from "next/link";
import { notFound } from "next/navigation";
import { assetUrl } from "@/api/client";
import { fetchCaseStudyBySlug } from "@/api/case-studies";

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
    <div className="mx-auto max-w-3xl px-4 py-14 text-hcode-muted md:py-20">
      <Link href="/case-studies" className="hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]">
        ← Case studies
      </Link>
      <h1 className="font-display mt-8 text-2xl uppercase text-black md:text-3xl">{c.title}</h1>
      {c.description ? <p className="mt-8 whitespace-pre-wrap leading-relaxed">{c.description}</p> : null}
      {c.externalLink ? (
        <a
          href={c.externalLink}
          className="mt-8 inline-block hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]"
          target="_blank"
          rel="noreferrer"
        >
          External link →
        </a>
      ) : null}
      <ul className="mt-8 space-y-2">
        {(c.attachments ?? []).map((a) => (
          <li key={a.media.path}>
            <a href={assetUrl(a.media.path)} className="text-sm hcode-link" target="_blank" rel="noreferrer">
              {a.media.path.split("/").pop()}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

