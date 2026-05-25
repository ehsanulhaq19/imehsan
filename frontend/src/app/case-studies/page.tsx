import { fetchCaseStudiesPage } from "@/api/case-studies";
import { BrandBack, BrandH1, BrandMain, BrandMuted } from "@/components/brand/BrandPage";
import { CaseStudiesCardFeed } from "@/components/content/CaseStudiesCardFeed";

type Row = { id: string; slug: string; title: string; description?: string | null };

export default async function CaseStudiesPage() {
  const first = await fetchCaseStudiesPage<Row>(1, 12);
  if (!first) {
    return (
      <BrandMain className="max-w-6xl">
        <BrandBack href="/">← Home</BrandBack>
        <BrandH1>Case studies</BrandH1>
        <BrandMuted>Could not load case studies.</BrandMuted>
      </BrandMain>
    );
  }
  return (
    <BrandMain className="max-w-6xl">
      <BrandBack href="/">← Home</BrandBack>
      <BrandH1>Case studies</BrandH1>
      {!first.items.length ? <BrandMuted>No case studies yet.</BrandMuted> : <CaseStudiesCardFeed initial={first} />}
    </BrandMain>
  );
}
