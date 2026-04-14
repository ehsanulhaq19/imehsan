import Link from "next/link";
import { fetchCaseStudiesList } from "@/api/case-studies";

type Row = { id: string; slug: string; title: string; description?: string | null };

export default async function CaseStudiesPage() {
  const list = await fetchCaseStudiesList<Row[]>();
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 text-hcode-muted md:py-20">
      <Link href="/" className="hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]">
        ← Home
      </Link>
      <h1 className="font-display mt-8 text-2xl uppercase text-black md:text-3xl">Case studies</h1>
      <ul className="mt-10 space-y-4">
        {(list ?? []).map((c) => (
          <li key={c.id} className="border border-hcode-border bg-white p-5">
            <Link href={`/case-studies/${c.slug}`} className="font-display text-lg font-normal uppercase text-black hover:text-hcode-violet">
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
      {!list?.length ? <p className="mt-10 text-sm text-hcode-muted/80">No case studies yet.</p> : null}
    </div>
  );
}

