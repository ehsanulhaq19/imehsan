import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { assetUrl } from "@/api/client";
import { fetchCertificationBySlug } from "@/api/certifications";

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
    <div className="mx-auto max-w-3xl px-4 py-14 text-hcode-muted md:py-20">
      <Link href="/certifications" className="hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]">
        ← Certifications
      </Link>
      <div className="relative mt-8 aspect-[16/10] w-full overflow-hidden border border-hcode-border bg-hcode-gray">
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
      <h1 className="font-display mt-8 text-2xl uppercase text-black md:text-3xl">{c.heading}</h1>
      {c.detail ? <p className="mt-8 whitespace-pre-wrap leading-relaxed">{c.detail}</p> : null}
      {c.linkUrl ? (
        <a
          href={c.linkUrl}
          className="mt-8 inline-block hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]"
          target="_blank"
          rel="noreferrer"
        >
          Credential link →
        </a>
      ) : null}
    </div>
  );
}
