import Image from "next/image";
import { notFound } from "next/navigation";
import { assetUrl } from "@/api/client";
import { fetchProjectBySlug } from "@/api/projects";
import { BrandBack, BrandH1, BrandMain } from "@/components/brand/BrandPage";

type Project = {
  heading: string;
  details?: string | null;
  link?: string | null;
  projectMedia?: { role: string; media: { path: string; mimeType: string } }[];
};

export default async function ProjectDetail({ params }: { params: { slug: string } }) {
  const p = await fetchProjectBySlug<Project>(params.slug);
  if (!p) notFound();
  return (
    <BrandMain>
      <BrandBack href="/projects">← Projects</BrandBack>
      <BrandH1>{p.heading}</BrandH1>
      {p.details ? <p className="mt-10 whitespace-pre-wrap font-brand text-[15px] font-light leading-[1.82] text-brand-muted">{p.details}</p> : null}
      {p.link ? (
        <a
          href={p.link}
          className="brand-link mt-10 inline-block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Project link →
        </a>
      ) : null}
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {(p.projectMedia ?? []).map((m) => (
          <div key={m.media.path} className="overflow-hidden border border-brand-outline-soft/40 bg-brand-surface-low">
            {m.media.mimeType.startsWith("video") ? (
              <video src={assetUrl(m.media.path)} controls className="w-full" />
            ) : (
              <Image src={assetUrl(m.media.path)} alt="" width={1200} height={800} className="h-auto w-full object-cover" unoptimized />
            )}
          </div>
        ))}
      </div>
    </BrandMain>
  );
}
