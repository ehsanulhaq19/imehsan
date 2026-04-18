import Image from "next/image";
import Link from "next/link";
import { assetUrl } from "@/api/client";
import { fetchCertificationsList, type CertificationListRow } from "@/api/certifications";

export default async function CertificationsPage() {
  const list = await fetchCertificationsList<CertificationListRow[]>();

  const preview = (text: string | null | undefined, n = 200) => {
    if (!text) return "";
    const t = text.replace(/\s+/g, " ").trim();
    return t.length > n ? `${t.slice(0, n)}…` : t;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 text-hcode-muted md:py-20">
      <Link href="/" className="hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]">
        ← Home
      </Link>
      <h1 className="font-display mt-8 text-2xl uppercase text-black md:text-3xl">Certifications</h1>
      <ul className="mt-10 space-y-8">
        {(list ?? []).map((c) => (
          <li key={c.id} className="border border-hcode-border bg-white p-5 md:flex md:gap-6">
            <div className="relative mb-4 h-28 w-full shrink-0 overflow-hidden border border-hcode-border bg-hcode-gray md:mb-0 md:h-32 md:w-40">
              {c.thumbnailUrl ? (
                <Image
                  src={assetUrl(c.thumbnailUrl)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 160px"
                  unoptimized
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/certifications/${c.slug}`}
                className="font-display text-lg font-normal uppercase text-black hover:text-hcode-violet"
              >
                {c.heading}
              </Link>
              {c.detail ? <p className="mt-3 text-sm leading-relaxed">{preview(c.detail)}</p> : null}
              <Link
                href={`/certifications/${c.slug}`}
                className="mt-3 inline-block hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]"
              >
                Read more
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {!list?.length ? <p className="mt-10 text-sm text-hcode-muted/80">No certifications published yet.</p> : null}
    </div>
  );
}
