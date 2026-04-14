import Link from "next/link";
import { fetchProjectsList } from "@/api/projects";

type Project = { id: string; slug: string; heading: string; details?: string | null };

export default async function ProjectsPage() {
  const list = await fetchProjectsList<Project[]>();
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 text-hcode-muted md:py-20">
      <Link href="/" className="hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]">
        ← Home
      </Link>
      <h1 className="font-display mt-8 text-2xl uppercase text-black md:text-3xl">Projects</h1>
      <ul className="mt-10 space-y-4">
        {(list ?? []).map((p) => (
          <li key={p.id} className="border border-hcode-border bg-white p-5">
            <Link href={`/projects/${p.slug}`} className="font-display text-lg font-normal uppercase text-black hover:text-hcode-violet">
              {p.heading}
            </Link>
            {p.details ? <p className="mt-3 text-sm leading-relaxed">{p.details.slice(0, 200)}…</p> : null}
          </li>
        ))}
      </ul>
      {!list?.length ? <p className="mt-10 text-sm text-hcode-muted/80">Nothing published yet.</p> : null}
    </div>
  );
}

