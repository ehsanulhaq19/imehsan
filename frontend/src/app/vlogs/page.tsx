import Link from "next/link";
import { fetchVlogsList } from "@/api/vlogs";

type Vlog = { id: string; slug: string; heading: string };

export default async function VlogsPage() {
  const list = await fetchVlogsList<Vlog[]>();
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 text-hcode-muted md:py-20">
      <Link href="/" className="hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]">
        ← Home
      </Link>
      <h1 className="font-display mt-8 text-2xl uppercase text-black md:text-3xl">Video logs</h1>
      <ul className="mt-10 space-y-4">
        {(list ?? []).map((v) => (
          <li key={v.id} className="border-b border-hcode-border pb-4">
            <Link href={`/vlogs/${v.slug}`} className="font-display text-lg font-normal uppercase text-black hover:text-hcode-violet">
              {v.heading}
            </Link>
          </li>
        ))}
      </ul>
      {!list?.length ? <p className="mt-10 text-sm text-hcode-muted/80">No vlogs published.</p> : null}
    </div>
  );
}

