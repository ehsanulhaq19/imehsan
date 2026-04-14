import Link from "next/link";
import { fetchGitReposList } from "@/api/git-repos";

type Repo = {
  id: string;
  name: string;
  url: string;
  description?: string | null;
  historyJson?: unknown[];
};

export default async function GitReposPage() {
  const list = await fetchGitReposList<Repo[]>();
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 text-hcode-muted md:py-20">
      <Link href="/" className="hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]">
        ← Home
      </Link>
      <h1 className="font-display mt-8 text-2xl uppercase text-black md:text-3xl">Git repositories</h1>
      <ul className="mt-10 space-y-6">
        {(list ?? []).map((r) => (
          <li key={r.id} className="border border-hcode-border bg-white p-5">
            <a
              href={r.url}
              className="font-display text-lg font-normal uppercase text-black hover:text-hcode-violet"
              target="_blank"
              rel="noreferrer"
            >
              {r.name}
            </a>
            {r.description ? <p className="mt-3 text-sm leading-relaxed">{r.description}</p> : null}
            {Array.isArray(r.historyJson) && r.historyJson.length ? (
              <pre className="mt-4 max-h-40 overflow-auto border border-hcode-border bg-hcode-gray p-3 text-xs">
                {JSON.stringify(r.historyJson, null, 2)}
              </pre>
            ) : null}
          </li>
        ))}
      </ul>
      {!list?.length ? <p className="mt-10 text-sm text-hcode-muted/80">Add repos from admin.</p> : null}
    </div>
  );
}

