import Link from "next/link";
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

export default async function HomePage() {
  const [projects, cases, repos, vlogs, testimonials, certs] = await Promise.all([
    fetchProjectsList<Project[]>(),
    fetchCaseStudiesList<CaseStudy[]>(),
    fetchGitReposList<Repo[]>(),
    fetchVlogsList<Vlog[]>(),
    fetchTestimonialsList<Testimonial[]>(),
    fetchCertificationsList<CertificationListRow[]>(),
  ]);

  const preview = (text: string | null | undefined, n = 140) => {
    if (!text) return "";
    const t = text.replace(/\s+/g, " ").trim();
    return t.length > n ? `${t.slice(0, n)}…` : t;
  };

  return (
    <div className="font-sans text-hcode-muted">
      <section className="bg-hcode-dark px-4 py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="hcode-section-title text-white/90">Ehsan Ul Haq · AI &amp; full-stack engineer</p>
          <div className="mt-2 h-0.5 w-8 bg-hcode-violet" />
          <h1 className="font-display mt-8 text-3xl font-light uppercase leading-tight tracking-tight text-white md:text-5xl md:leading-[1.15]">
            Production-grade platforms, <span className="font-semibold">AI-driven products</span>, and solid backends—with
            Next.js, Node, NestJS, and beyond.
          </h1>
          <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-white/80 md:text-lg md:leading-7">
            Seven-plus years delivering B2B and B2C systems, real-time collaboration, e-commerce, and AI assistants. I pair
            thoughtful architecture with DevOps and cloud so ideas ship reliably. Browse highlights below, dive into each
            section, book a call, or open the assistant anytime.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/projects" className="hcode-btn-outline !text-white !border-white hover:!bg-white hover:!text-hcode-dark">
              View projects
            </Link>
            <Link href="/booking" className="hcode-btn !border-white !bg-white !text-black hover:!bg-transparent hover:!text-white">
              Book appointment
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="space-y-0">
          <article className="border border-hcode-border bg-white p-6 md:p-12">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="hcode-section-title">Projects</h2>
                <div className="mt-3 h-0.5 w-8 bg-black" />
              </div>
              <Link href="/projects" className="hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]">
                View all
              </Link>
            </div>
            <ul className="grid gap-6 md:grid-cols-2">
              {(projects ?? []).slice(0, 4).map((p) => (
                <li key={p.id} className="border border-hcode-border bg-hcode-gray/50 p-5 transition-colors hover:bg-white">
                  <Link href={`/projects/${p.slug}`} className="font-display text-base font-normal uppercase text-black hover:text-hcode-violet">
                    {p.heading}
                  </Link>
                  <p className="mt-3 text-sm leading-relaxed">{preview(p.details)}</p>
                </li>
              ))}
            </ul>
            {!projects?.length ? <p className="text-sm text-hcode-muted/80">No projects yet — add some from the admin panel.</p> : null}
          </article>

          <article className="border border-t-0 border-hcode-border bg-hcode-gray p-6 md:p-12">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="hcode-section-title">Case studies</h2>
                <div className="mt-3 h-0.5 w-8 bg-hcode-violet" />
              </div>
              <Link href="/case-studies" className="hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]">
                View all
              </Link>
            </div>
            <ul className="grid gap-6 md:grid-cols-2">
              {(cases ?? []).slice(0, 4).map((c) => (
                <li key={c.id} className="border border-hcode-border bg-white p-5">
                  <Link href={`/case-studies/${c.slug}`} className="font-display text-base font-normal uppercase text-black hover:text-hcode-violet">
                    {c.title}
                  </Link>
                  <p className="mt-3 text-sm leading-relaxed">{preview(c.description)}</p>
                </li>
              ))}
            </ul>
            {!cases?.length ? <p className="text-sm text-hcode-muted/80">Case studies will appear here once published.</p> : null}
          </article>

          <article className="border border-t-0 border-hcode-border bg-white p-6 md:p-12">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="hcode-section-title">Git repositories</h2>
                <div className="mt-3 h-0.5 w-8 bg-black" />
              </div>
              <Link href="/git-repos" className="hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]">
                View all
              </Link>
            </div>
            <ul className="space-y-4">
              {(repos ?? []).slice(0, 5).map((r) => (
                <li key={r.id} className="border-b border-hcode-border pb-4 last:border-0 last:pb-0">
                  <a href={r.url} className="font-display text-sm uppercase text-black hover:text-hcode-violet" target="_blank" rel="noreferrer">
                    {r.name}
                  </a>
                </li>
              ))}
            </ul>
            {!repos?.length ? <p className="text-sm text-hcode-muted/80">Hook up repositories from admin.</p> : null}
          </article>

          <article className="border border-t-0 border-hcode-border bg-hcode-gray p-6 md:p-12">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="hcode-section-title">Video logs</h2>
                <div className="mt-3 h-0.5 w-8 bg-hcode-violet" />
              </div>
              <Link href="/vlogs" className="hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]">
                View all
              </Link>
            </div>
            <ul className="grid gap-6 md:grid-cols-2">
              {(vlogs ?? []).slice(0, 4).map((v) => (
                <li key={v.id} className="border border-hcode-border bg-white p-5">
                  <Link href={`/vlogs/${v.slug}`} className="font-display text-base font-normal uppercase text-black hover:text-hcode-violet">
                    {v.heading}
                  </Link>
                </li>
              ))}
            </ul>
            {!vlogs?.length ? (
              <p className="text-sm text-hcode-muted/80">Publish vlogs from admin with thumbnails and media.</p>
            ) : null}
          </article>

          <article className="border border-t-0 border-hcode-border bg-white p-6 md:p-12">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="hcode-section-title">Certifications</h2>
                <div className="mt-3 h-0.5 w-8 bg-hcode-violet" />
              </div>
              <Link href="/certifications" className="hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]">
                View all
              </Link>
            </div>
            <ul className="grid gap-6 md:grid-cols-2">
              {(certs ?? []).slice(0, 4).map((c) => (
                <li key={c.id} className="border border-hcode-border bg-white p-5">
                  <Link
                    href={`/certifications/${c.slug}`}
                    className="font-display text-base font-normal uppercase text-black hover:text-hcode-violet"
                  >
                    {c.heading}
                  </Link>
                  <p className="mt-3 text-sm leading-relaxed">{preview(c.detail)}</p>
                </li>
              ))}
            </ul>
            {!certs?.length ? (
              <p className="text-sm text-hcode-muted/80">Publish certifications from the admin API when ready.</p>
            ) : null}
          </article>

          <article className="border border-t-0 border-hcode-border bg-hcode-gray p-6 md:p-12">
            <div className="mb-8">
              <h2 className="hcode-section-title">Testimonials</h2>
              <div className="mt-3 h-0.5 w-8 bg-black" />
            </div>
            <ul className="space-y-8">
              {(testimonials ?? []).slice(0, 3).map((t) => (
                <li key={t.id} className="border-l-4 border-hcode-violet pl-6">
                  <p className="text-base leading-relaxed text-hcode-muted">&ldquo;{t.quote}&rdquo;</p>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-black">— {t.authorName}</p>
                </li>
              ))}
            </ul>
            {!testimonials?.length ? <p className="text-sm text-hcode-muted/80">Approved testimonials show here.</p> : null}
          </article>

          <article className="border border-t-0 border-hcode-border bg-hcode-dark p-6 text-white md:p-12">
            <h2 className="hcode-section-title !text-white">Book an appointment</h2>

            <div className="mt-3 h-0.5 w-8 bg-hcode-violet" />

            <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/80">
              Pick a slot and share context; uploads are validated server-side. SMTP must be configured on the backend for email
              confirmations.
            </p>
            <Link href="/booking" className="mt-8 inline-block hcode-btn !border-white !bg-white !text-black hover:!border-white hover:!bg-transparent hover:!text-white">
              Open booking form
            </Link>
          </article>
        </div>
      </div>
    </div>
  );
}
