import { LandingSections } from "@/components/landing/LandingSections";
import type { CertificationListRow } from "@/api/certifications";
import { fetchCaseStudiesPage } from "@/api/case-studies";
import { fetchCertificationsPage } from "@/api/certifications";
import { fetchGitReposList } from "@/api/git-repos";
import type { ProjectListRow } from "@/api/projects";
import { fetchProjectsPage } from "@/api/projects";
import { fetchTestimonialsPage } from "@/api/testimonials";
import type { VlogListRow } from "@/api/vlogs";
import { fetchVlogsPage } from "@/api/vlogs";
import {
  coverForCaseStudy,
  coverForCertification,
  coverForProject,
  coverForTestimonial,
  coverForVlog,
} from "@/components/content/cardCovers";
import { excerptPlain, SLUG_HOVER_GRID_DESCRIPTION_MAX } from "@/lib/html-plain";

type CaseStudy = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  attachments?: { media: { path: string; mimeType: string } }[];
};
type Repo = { id: string; name: string; url: string };
type Testimonial = {
  id: string;
  authorName: string;
  quote: string;
  coverImageUrl?: string | null;
  images?: { media: { path: string; mimeType: string } }[];
};

export default async function HomePage() {
  const [projectsRes, casesRes, repos, vlogsRes, testimonialsRes, certsRes] = await Promise.all([
    fetchProjectsPage(1, 24),
    fetchCaseStudiesPage<CaseStudy>(1, 24),
    fetchGitReposList<Repo[]>(),
    fetchVlogsPage(1, 24),
    fetchTestimonialsPage(1, 3),
    fetchCertificationsPage(1, 24),
  ]);

  const projects = projectsRes?.items ?? [];
  const cases = casesRes?.items ?? [];
  const vlogs = (vlogsRes?.items ?? []) as VlogListRow[];
  const certs = certsRes?.items ?? [];

  const projectItems = projects.slice(0, 6).map((p: ProjectListRow) => {
    const pm = p.projectMedia ?? [];
    const vid = pm.find((m) => m.media.mimeType.startsWith("video"));
    return {
      id: p.id,
      title: p.heading,
      blurb: excerptPlain(p.details, SLUG_HOVER_GRID_DESCRIPTION_MAX),
      href: `/projects/${p.slug}`,
      image: coverForProject(p),
      video: vid?.media.path,
    };
  });

  const caseItems = cases.slice(0, 6).map((c: CaseStudy) => ({
    id: c.id,
    title: c.title,
    blurb: excerptPlain(c.description, SLUG_HOVER_GRID_DESCRIPTION_MAX),
    href: `/case-studies/${c.slug}`,
    image: coverForCaseStudy(c),
  }));

  const vlogItems = vlogs.slice(0, 6).map((v: VlogListRow) => {
    const { image, video } = coverForVlog(v);
    return {
      id: v.id,
      title: v.heading,
      blurb: excerptPlain(v.description, SLUG_HOVER_GRID_DESCRIPTION_MAX),
      href: `/vlogs/${v.slug}`,
      image,
      video,
    };
  });

  const certItems = (certs as CertificationListRow[]).slice(0, 6).map((c: CertificationListRow) => ({
    id: c.id,
    title: c.heading,
    blurb: excerptPlain(c.detail, SLUG_HOVER_GRID_DESCRIPTION_MAX),
    href: `/certifications/${c.slug}`,
    image: coverForCertification(c),
  }));

  const testimonialInitial = testimonialsRes
    ? {
        items: (testimonialsRes.items ?? []).map((t: Testimonial) => ({
          id: t.id,
          authorName: t.authorName,
          quote: t.quote,
          image: coverForTestimonial(t),
        })),
        meta: testimonialsRes.meta,
      }
    : null;

  return (
    <LandingSections
      projects={projectItems}
      caseStudies={caseItems}
      repos={repos ?? []}
      vlogs={vlogItems}
      certifications={certItems}
      testimonialsInitial={testimonialInitial}
    />
  );
}
