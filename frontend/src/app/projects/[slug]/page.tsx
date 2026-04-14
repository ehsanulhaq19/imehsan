import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { assetUrl } from "@/api/client";
import { fetchProjectBySlug } from "@/api/projects";

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
    <div className="mx-auto max-w-3xl px-4 py-14 text-hcode-muted md:py-20">
      <Link href="/projects" className="hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]">
        ← Projects
      </Link>
      <h1 className="font-display mt-8 text-2xl uppercase text-black md:text-3xl">{p.heading}</h1>
      {p.details ? <p className="mt-8 whitespace-pre-wrap leading-relaxed">{p.details}</p> : null}
      {p.link ? (
        <a
          href={p.link}
          className="mt-8 inline-block hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]"
          target="_blank"
          rel="noreferrer"
        >
          Project link →
        </a>
      ) : null}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {(p.projectMedia ?? []).map((m) => (
          <div key={m.media.path} className="overflow-hidden border border-hcode-border bg-hcode-gray">
            {m.media.mimeType.startsWith("video") ? (
              <video src={assetUrl(m.media.path)} controls className="w-full" />
            ) : (
              <Image
                src={assetUrl(m.media.path)}
                alt=""
                width={1200}
                height={800}
                className="h-auto w-full object-cover"
                unoptimized
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

