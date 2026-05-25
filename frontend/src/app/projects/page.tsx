import { fetchProjectsPage } from "@/api/projects";
import { BrandBack, BrandH1, BrandMain, BrandMuted } from "@/components/brand/BrandPage";
import { ProjectsCardFeed } from "@/components/content/ProjectsCardFeed";

export default async function ProjectsPage() {
  const first = await fetchProjectsPage(1, 12);
  if (!first) {
    return (
      <BrandMain className="max-w-6xl">
        <BrandBack href="/">← Home</BrandBack>
        <BrandH1>Projects</BrandH1>
        <BrandMuted>Could not load projects.</BrandMuted>
      </BrandMain>
    );
  }
  return (
    <BrandMain className="max-w-6xl">
      <BrandBack href="/">← Home</BrandBack>
      <BrandH1>Projects</BrandH1>
      {!first.items.length ? <BrandMuted>Nothing published yet.</BrandMuted> : <ProjectsCardFeed initial={first} />}
    </BrandMain>
  );
}
