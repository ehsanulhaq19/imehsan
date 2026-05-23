import { LandingSections } from "@/components/landing/LandingSections";
import { fetchCaseStudiesList } from "@/api/case-studies";
import { fetchCertificationsList, type CertificationListRow } from "@/api/certifications";
import { fetchGitReposList } from "@/api/git-repos";
import { fetchProjectsList } from "@/api/projects";
import { fetchTestimonialsList } from "@/api/testimonials";
import { fetchVlogsList } from "@/api/vlogs";

type Project = {
  id: string;
  slug: string;
  heading: string;
  details?: string | null;
};
type CaseStudy = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
};
type Repo = { id: string; name: string; url: string };
type Vlog = { id: string; slug: string; heading: string };
type Testimonial = { id: string; authorName: string; quote: string };

function shorten(text: string | null | undefined, n = 140) {
  if (!text) return "";
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

export default async function HomePage() {
  const [projects, cases, repos, vlogs, testimonials, certs] = await Promise.all([
    fetchProjectsList<Project[]>(),
    fetchCaseStudiesList<CaseStudy[]>(),
    fetchGitReposList<Repo[]>(),
    fetchVlogsList<Vlog[]>(),
    fetchTestimonialsList<Testimonial[]>(),
    fetchCertificationsList<CertificationListRow[]>(),
  ]);

  const projectItems = (projects ?? []).slice(0, 4).map((p) => ({
    id: p.id,
    title: p.heading,
    blurb: shorten(p.details),
    href: `/projects/${p.slug}`,
  }));

  const caseItems = (cases ?? []).slice(0, 4).map((c) => ({
    id: c.id,
    title: c.title,
    blurb: shorten(c.description),
    href: `/case-studies/${c.slug}`,
  }));

  const vlogItems = (vlogs ?? []).slice(0, 4).map((v) => ({
    id: v.id,
    title: v.heading,
    blurb: "",
    href: `/vlogs/${v.slug}`,
  }));

  const certItems = (certs ?? []).slice(0, 4).map((c) => ({
    id: c.id,
    title: c.heading,
    blurb: shorten(c.detail),
    href: `/certifications/${c.slug}`,
  }));

  return (
    <LandingSections
      projects={projectItems}
      caseStudies={caseItems}
      repos={repos ?? []}
      vlogs={vlogItems}
      certifications={certItems}
      testimonials={testimonials ?? []}
    />
  );
}
