import Link from "next/link";
import { fetchGitReposList } from "@/api/git-repos";
import { BrandBack, BrandH1, BrandMain, BrandMuted } from "@/components/brand/BrandPage";

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
    <BrandMain>
      <BrandBack href="/">← Home</BrandBack>
      <BrandH1>Git repositories</BrandH1>
      <ul className="mt-12 space-y-6">
        {(list ?? []).map((r) => (
          <li key={r.id} className="brand-card rounded-sm border border-brand-outline-soft/40 p-6">
            <Link
              href={r.url}
              className="font-brand text-[17px] font-semibold uppercase tracking-[0.06em] text-brand-fg transition-colors hover:text-brand-tertiary"
              target="_blank"
              rel="noopener noreferrer"
            >
              {r.name}
            </Link>
            {r.description ? <p className="mt-3 font-brand text-[14px] font-light leading-[1.7] text-brand-secondary">{r.description}</p> : null}
            {Array.isArray(r.historyJson) && r.historyJson.length ? (
              <pre className="mt-4 max-h-40 overflow-auto rounded-sm border border-brand-outline-soft/45 bg-brand-surface-low p-3 font-brand-mono text-[11px] leading-snug text-brand-muted">{JSON.stringify(r.historyJson, null, 2)}</pre>
            ) : null}
          </li>
        ))}
      </ul>
      {!list?.length ? <BrandMuted>Add repos from admin.</BrandMuted> : null}
    </BrandMain>
  );
}
