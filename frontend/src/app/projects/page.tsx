import { BrandBack, BrandH1, BrandList, BrandListItem, BrandListLink, BrandMain, BrandMuted } from "@/components/brand/BrandPage";
import { fetchProjectsList } from "@/api/projects";

type Project = { id: string; slug: string; heading: string; details?: string | null };

export default async function ProjectsPage() {
  const list = await fetchProjectsList<Project[]>();

  return (
    <BrandMain>
      <BrandBack href="/">← Home</BrandBack>
      <BrandH1>Projects</BrandH1>
      <BrandList>
        {(list ?? []).map((p) => {
          const excerpt =
            p.details && p.details.length > 200 ? `${p.details.slice(0, 200)}…` : (p.details ?? "");
          return (
            <BrandListItem key={p.id}>
              <BrandListLink href={`/projects/${p.slug}`}>{p.heading}</BrandListLink>
              {excerpt ? <p className="mt-3 font-brand text-[14px] font-light leading-[1.7] text-brand-secondary">{excerpt}</p> : null}
            </BrandListItem>
          );
        })}
      </BrandList>
      {!list?.length ? <BrandMuted>Nothing published yet.</BrandMuted> : null}
    </BrandMain>
  );
}
