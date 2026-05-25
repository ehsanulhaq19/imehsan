import Image from "next/image";
import { notFound } from "next/navigation";
import { assetUrl } from "@/api/client";
import { fetchProjectBySlug } from "@/api/projects";
import { BrandBack, BrandH1, BrandMain } from "@/components/brand/BrandPage";
import { ScrollReveal } from "@/components/content/ScrollReveal";
import { ExternalLinkPreview } from "@/components/brand/ExternalLinkPreview";
import { SafeRichText } from "@/components/SafeRichText";
import { stripHtmlToPlainText } from "@/lib/html-plain";

type Project = {
  heading: string;
  details?: string | null;
  link?: string | null;
  coverImageUrl?: string | null;
  projectMedia?: { role: string; media: { path: string; mimeType: string } }[];
};

export default async function ProjectDetail({ params }: { params: { slug: string } }) {
  const p = await fetchProjectBySlug<Project>(params.slug);
  if (!p) notFound();
  const mediaItems = p.projectMedia ?? [];

  return (
    <BrandMain className="max-w-6xl">
      <BrandBack href="/projects">← Projects</BrandBack>
      {p.coverImageUrl?.trim() ? (
        <div className="relative mt-8 aspect-[21/9] w-full overflow-hidden border border-brand-outline-soft/40">
          <Image
            src={assetUrl(p.coverImageUrl)}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 72rem"
            unoptimized
            priority
          />
        </div>
      ) : null}
      <BrandH1>{p.heading}</BrandH1>
      {stripHtmlToPlainText(p.details) ? <SafeRichText html={p.details ?? ""} className="mt-10" /> : null}
      {p.link ? <ExternalLinkPreview href={p.link} heading="Project link preview" /> : null}

      <div className="mt-14 flex flex-col gap-6">
        {mediaItems.map((m, i) => {
          const wide = i % 4 === 1;
          const tilt = i % 3 === 0;
          const href = assetUrl(m.media.path);
          return (
            <ScrollReveal key={m.media.path + m.role} delay={Math.min(i * 0.07, 0.45)}>
              <div
                className={`overflow-hidden bg-brand-surface-low/35 shadow-[14px_32px_48px_-36px_rgb(11_28_48_/0.62)] ring-1 ring-brand-outline-soft/40 transition-transform duration-300 ${
                  wide ? "w-full lg:max-w-none" : "max-w-3xl"
                } ${tilt ? "border-l-[5px] border-brand-tertiary/65" : "border border-brand-outline-soft/30"}`}
              >
                {m.media.mimeType.startsWith("video") ? (
                  <video src={href} controls className="w-full" preload="metadata" />
                ) : (
                  <div className={`relative ${wide ? "aspect-[21/10]" : "aspect-[16/10]"}`}>
                    <Image src={href} alt="" fill className="object-cover" sizes="(max-width:1024px) 100vw, 896px" unoptimized />
                  </div>
                )}
              </div>
            </ScrollReveal>
          );
        })}
      </div>
      {!mediaItems.length ? <p className="mt-10 font-brand text-[14px] text-brand-secondary">No gallery media yet.</p> : null}
    </BrandMain>
  );
}
