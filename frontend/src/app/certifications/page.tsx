import Image from "next/image";
import Link from "next/link";
import { assetUrl } from "@/api/client";
import { fetchCertificationsList, type CertificationListRow } from "@/api/certifications";
import { BrandBack, BrandH1, BrandMain, BrandMuted } from "@/components/brand/BrandPage";

export default async function CertificationsPage() {
  const list = await fetchCertificationsList<CertificationListRow[]>();

  const preview = (text: string | null | undefined, n = 200) => {
    if (!text) return "";
    const t = text.replace(/\s+/g, " ").trim();
    return t.length > n ? `${t.slice(0, n)}…` : t;
  };

  return (
    <BrandMain>
      <BrandBack href="/">← Home</BrandBack>
      <BrandH1>Certifications</BrandH1>
      <ul className="mt-12 space-y-8">
        {(list ?? []).map((c) => (
          <li key={c.id} className="brand-card flex flex-col gap-6 p-6 backdrop-blur-sm md:flex-row md:items-start md:gap-8">
            <div className="relative h-32 w-full shrink-0 overflow-hidden border border-brand-outline-soft/35 bg-brand-surface md:h-36 md:w-44">
              {c.thumbnailUrl ? (
                <Image
                  src={assetUrl(c.thumbnailUrl)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 176px"
                  unoptimized
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/certifications/${c.slug}`} className="font-brand text-[17px] font-semibold uppercase tracking-[0.06em] text-brand-fg transition-colors hover:text-brand-tertiary">
                {c.heading}
              </Link>
              {c.detail ? <p className="mt-3 font-brand text-[14px] font-light leading-[1.72] text-brand-secondary">{preview(c.detail)}</p> : null}
              <Link href={`/certifications/${c.slug}`} className="brand-link mt-4 inline-block font-mono text-[10px] font-semibold uppercase tracking-[0.2em]">
                Read more →
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {!list?.length ? <BrandMuted>No certifications published yet.</BrandMuted> : null}
    </BrandMain>
  );
}
