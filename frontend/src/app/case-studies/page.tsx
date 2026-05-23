import { fetchCaseStudiesList } from "@/api/case-studies";
import {
  BrandBack,
  BrandH1,
  BrandList,
  BrandListItem,
  BrandListLink,
  BrandMain,
  BrandMuted,
} from "@/components/brand/BrandPage";

type Row = { id: string; slug: string; title: string; description?: string | null };

export default async function CaseStudiesPage() {
  const list = await fetchCaseStudiesList<Row[]>();
  return (
    <BrandMain>
      <BrandBack href="/">← Home</BrandBack>
      <BrandH1>Case studies</BrandH1>
      <BrandList>
        {(list ?? []).map((c) => (
          <BrandListItem key={c.id}>
            <BrandListLink href={`/case-studies/${c.slug}`}>{c.title}</BrandListLink>
            {c.description ? (
              <p className="mt-3 font-brand text-[14px] font-light leading-[1.7] text-brand-secondary">{c.description.slice(0, 220)}{c.description.length > 220 ? "…" : ""}</p>
            ) : null}
          </BrandListItem>
        ))}
      </BrandList>
      {!list?.length ? <BrandMuted>No case studies yet.</BrandMuted> : null}
    </BrandMain>
  );
}
