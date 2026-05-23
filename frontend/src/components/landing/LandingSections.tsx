"use client";

import Link from "next/link";
import { content } from "@/lib/content-registry";
import { Scroll3DSection } from "./Scroll3DSection";

const { landing: L, profile: P } = content;

type Item = {
  id: string;
  title: string;
  blurb: string;
  href: string;
};

type Repo = { id: string; name: string; url: string };

export type LandingSectionsProps = {
  projects: Item[];
  caseStudies: Item[];
  repos: Repo[];
  vlogs: Item[];
  certifications: Item[];
  testimonials: { id: string; authorName: string; quote: string }[];
};

function IconArrow({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function SectionShell({
  eyebrow,
  title,
  lead,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-content px-page-x md:px-page-x-md">
      {eyebrow ? (
        <p className="font-brand-mono text-fp-tag font-semibold uppercase text-brand-tertiary">{eyebrow}</p>
      ) : null}
      <h2 className="font-brand-display text-fp-section mt-5 font-bold text-brand-fg md:mt-7">{title}</h2>
      {lead ? <p className="mt-6 max-w-3xl font-brand text-fp-body leading-[1.7] text-brand-secondary">{lead}</p> : null}
      <div className="mt-10 md:mt-14">{children}</div>
      {footer ? <div className="mt-10 md:mt-14">{footer}</div> : null}
    </div>
  );
}

export function LandingSections({
  projects,
  caseStudies,
  repos,
  vlogs,
  certifications,
  testimonials,
}: LandingSectionsProps) {
  const S = L.sections;
  const cp = L.philosophy.codePanel;

  return (
    <>
      <Scroll3DSection className="overflow-hidden pb-14 md:pb-20">
        <div className="relative flex min-h-[min(88svh,52rem)] items-center justify-start">
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote marketing hero asset */}
            <img alt={L.hero.imageAlt} className="h-full w-full object-cover" src={L.assets.heroImageUrl} />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/75 to-transparent" />
          </div>
          <div className="relative z-10 mx-auto w-full max-w-content px-page-x md:px-page-x-md">
            <div className="max-w-2xl">
              <p className="font-brand-mono text-fp-tag font-medium uppercase text-brand-tertiary">{P.title}</p>
              <h1 className="font-brand-display text-fp-hero mt-5 font-extrabold leading-[1.06] text-brand-fg">
                {L.hero.headlineBeforeAccent}
                <span className="text-brand-tertiary">{L.hero.headlineAccent}</span>
                {L.hero.headlineAfterAccent}
              </h1>
              <p className="mt-7 max-w-xl font-brand text-fp-hero-sub font-medium leading-[1.72] text-brand-secondary">{P.summary}</p>
              <div className="mt-11 flex flex-wrap gap-4">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 bg-brand-fg px-8 py-3.5 font-brand text-fp-button font-semibold uppercase text-brand-bg transition-opacity hover:opacity-90"
                >
                  {L.hero.primaryCta}
                  <IconArrow className="h-4 w-4" />
                </Link>
                <Link
                  href="/booking"
                  className="border border-brand-outline px-8 py-3.5 font-brand text-fp-button font-semibold uppercase text-brand-fg transition-colors hover:bg-brand-surface-low"
                >
                  {L.hero.secondaryCta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Scroll3DSection>

      <Scroll3DSection className="border-y border-brand-outline-soft/25 bg-brand-surface-low py-14 md:py-16">
        <div className="mx-auto max-w-content px-page-x md:px-page-x-md">
          <p className="font-brand text-fp-small text-center font-semibold uppercase text-brand-muted">{L.trustStrip.label}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-85 md:justify-between md:gap-y-8">
            {L.trustStrip.items.map((label) => (
              <span key={label} className="font-brand-display text-fp-sub font-bold text-brand-fg/85 md:text-fp-section">
                {label}
              </span>
            ))}
          </div>
        </div>
      </Scroll3DSection>

      <Scroll3DSection className="py-20 md:py-28">
        <div className="mx-auto grid max-w-content gap-12 px-page-x md:grid-cols-3 md:gap-16 md:px-page-x-md">
          {L.metrics.map((row) => {
            const v = row.valueKey === "experienceYears" ? P.experienceYears : row.staticValue ?? "";
            return (
              <div
                key={row.label}
                className="card-3d-tilt border border-brand-outline-soft/30 bg-brand-white/85 p-8 shadow-[0_22px_60px_-28px_rgb(11_28_48_/_0.35)] backdrop-blur-sm"
              >
                <p className="font-brand-display text-fp-section font-bold text-brand-tertiary">{v}</p>
                <p className="mt-4 font-brand text-fp-body leading-relaxed text-brand-secondary">{row.label}</p>
              </div>
            );
          })}
        </div>
      </Scroll3DSection>

      <Scroll3DSection className="pb-20 md:pb-32">
        <div className="mx-auto grid max-w-content gap-16 px-page-x md:grid-cols-2 md:gap-24 md:px-page-x-md">
          <div>
            <h2 className="font-brand-display text-fp-section font-bold text-brand-fg">{L.philosophy.heading}</h2>
            <div className="mt-12 space-y-10">
              {L.philosophy.pillars.map((pillar) => (
                <div key={pillar.title} className="group border-b border-brand-fg/10 pb-8">
                  <h3 className="font-brand-display text-fp-card font-semibold transition-colors group-hover:text-brand-tertiary md:text-fp-sub">{pillar.title}</h3>
                  <p className="mt-3 font-brand text-fp-body leading-relaxed text-brand-secondary/85">{pillar.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative hidden min-h-[20rem] md:block">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-tertiary/25 to-transparent blur-[100px]" />
            <div className="relative z-10 overflow-hidden rounded-xl border border-brand-fg/10 bg-brand-white/70 p-8 font-brand-mono text-fp-small leading-relaxed text-brand-muted shadow-xl backdrop-blur-xl">
              <div className="mb-6 flex gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/55" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/55" />
                <span className="h-3 w-3 rounded-full bg-green-500/55" />
              </div>
              <span className="text-brand-tertiary">class</span> <span className="text-blue-700">{cp.className}</span>:<br />
              &nbsp;&nbsp;<span className="text-brand-tertiary">def</span> <span className="text-blue-700">__init__</span>(self, focus):<br />
              &nbsp;&nbsp;&nbsp;&nbsp;{cp.initLine}
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;self.stack = [{cp.stackItems.join(", ")}]
              <br />
              <br />
              &nbsp;&nbsp;<span className="text-brand-tertiary">def</span> <span className="text-blue-700">{cp.methodName}</span>(self, roadmap):<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-brand-tertiary">return</span> {cp.methodReturn}
              <br />
              <br />
              service = {cp.className}(focus={cp.instanceFocus})
              <br />
              service.{cp.methodName}({cp.shipArg})
              <div className="pointer-events-none absolute bottom-3 right-3 select-none text-7xl font-bold text-brand-fg/[0.07]">✦</div>
            </div>
          </div>
        </div>
      </Scroll3DSection>

      <Scroll3DSection className="border-t border-brand-outline-soft/25 bg-brand-surface-low py-20 md:py-28">
        <SectionShell
          eyebrow={S.projects.eyebrow}
          title={S.projects.title}
          lead={S.projects.lead}
          footer={
            <div className="flex justify-start">
              <Link href="/projects" className="inline-flex items-center gap-2 border-b border-brand-fg pb-1 font-brand text-fp-small font-semibold text-brand-fg hover:border-brand-tertiary hover:text-brand-tertiary">
                {S.projects.footerLink} <IconArrow className="h-4 w-4" />
              </Link>
            </div>
          }
        >
          {!projects.length ? (
            <p className="font-brand text-brand-secondary">{S.projects.empty}</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-12 md:gap-10">
              <div className="card-3d-tilt md:col-span-8 md:min-h-[28rem]">
                <FeaturedProjectCard item={projects[0]} emphasize copy={S.projects} />
              </div>
              <div className="flex flex-col gap-8 md:col-span-4">
                {projects.slice(1, 3).map((p) => (
                  <div key={p.id} className="card-3d-tilt flex-1">
                    <CompactCard item={p} copy={S.projects} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionShell>
      </Scroll3DSection>

      <Scroll3DSection className="marketing-grid-bg py-20 md:py-28">
        <SectionShell
          eyebrow={S.caseStudies.eyebrow}
          title={S.caseStudies.title}
          lead={S.caseStudies.lead}
          footer={
            <Link href="/case-studies" className="inline-flex items-center gap-2 border-b border-brand-fg pb-1 font-brand text-fp-small font-semibold text-brand-fg hover:border-brand-tertiary hover:text-brand-tertiary">
              {S.caseStudies.footerLink} <IconArrow className="h-4 w-4" />
            </Link>
          }
        >
          <div className="grid gap-16 md:gap-28">
            {caseStudies.slice(0, 2).map((c, i) => (
              <article key={c.id} className={`card-3d-tilt grid gap-10 md:grid-cols-12 md:gap-14 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className="aspect-[16/10] overflow-hidden rounded-sm border border-brand-outline-soft/30 bg-brand-surface md:col-span-7">
                  <div className="flex h-full w-full flex-col justify-end bg-gradient-to-br from-brand-tertiary/15 via-brand-bg to-brand-surface p-10">
                    <span className="font-brand-mono text-fp-tag uppercase text-brand-muted">{c.href.replace(/^\//, "")}</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center md:col-span-5">
                  <h3 className="font-brand-display text-fp-sub font-bold text-brand-fg">{c.title}</h3>
                  <p className="mt-5 font-brand text-fp-body leading-relaxed text-brand-secondary">{c.blurb}</p>
                  <Link href={c.href} className="mt-8 inline-flex w-max items-center gap-2 font-brand text-fp-small font-semibold text-brand-tertiary hover:underline">
                    {S.caseStudies.readLink} <IconArrow className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          {caseStudies.length === 0 ? <p className="font-brand text-brand-secondary">{S.caseStudies.empty}</p> : null}
        </SectionShell>
      </Scroll3DSection>

      <Scroll3DSection className="py-20 md:py-28">
        <SectionShell eyebrow={S.repos.eyebrow} title={S.repos.title} lead={undefined}>
          {repos.length === 0 ? (
            <p className="font-brand text-brand-secondary">{S.repos.empty}</p>
          ) : (
            <div className="grid gap-10 md:grid-cols-12">
              <div className="card-3d-tilt border border-brand-outline-soft/30 bg-brand-white/95 p-10 shadow-xl md:col-span-8">
                <p className="font-brand-mono text-fp-tag uppercase text-brand-tertiary">{S.repos.highlighted}</p>
                <h3 className="font-brand-display text-fp-sub mt-4 font-bold text-brand-fg">{repos[0].name}</h3>
                <p className="mt-4 font-brand text-fp-body leading-relaxed text-brand-secondary">{S.repos.highlightLead}</p>
                <a
                  href={repos[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 font-brand text-fp-small font-semibold text-brand-fg underline-offset-8 hover:text-brand-tertiary hover:underline"
                >
                  {S.repos.openRepo} <IconArrow className="h-4 w-4" />
                </a>
              </div>
              <div className="card-3d-tilt flex flex-col justify-between rounded-sm border border-brand-outline-soft/25 bg-brand-surface-low p-8 md:col-span-4">
                <div>
                  <p className="font-brand-display text-fp-card font-bold text-brand-fg">{S.repos.moreTitle}</p>
                  <ul className="mt-8 space-y-4 font-brand text-fp-small text-brand-secondary">
                    {repos.slice(1, 5).map((r) => (
                      <li key={r.id}>
                        <a className="text-brand-fg underline-offset-[6px] hover:text-brand-tertiary hover:underline" href={r.url} target="_blank" rel="noopener noreferrer">
                          {r.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/git-repos" className="mt-12 inline-flex font-brand text-fp-small font-semibold text-brand-tertiary hover:underline">
                  {S.repos.curatedList} {S.repos.arrow}
                </Link>
              </div>
            </div>
          )}
        </SectionShell>
      </Scroll3DSection>

      <Scroll3DSection className="border-y border-brand-outline-soft/20 bg-brand-surface-low py-20 md:py-24">
        <SectionShell
          eyebrow={S.vlogs.eyebrow}
          title={S.vlogs.title}
          lead={undefined}
          footer={
            <Link href="/vlogs" className="inline-flex items-center gap-2 font-brand text-fp-small font-semibold text-brand-tertiary hover:underline">
              {S.vlogs.footerLink} {S.repos.arrow}
            </Link>
          }
        >
          {vlogs.length === 0 ? (
            <p className="font-brand text-brand-secondary">{S.vlogs.empty}</p>
          ) : (
            <ul className="grid gap-8 sm:grid-cols-2">
              {vlogs.slice(0, 4).map((v) => (
                <li key={v.id} className="card-3d-tilt rounded-sm border border-brand-outline-soft/25 bg-brand-white/95 p-7">
                  <Link href={v.href} className="font-brand-display text-fp-card font-semibold text-brand-fg hover:text-brand-tertiary">
                    {v.title}
                  </Link>
                  <p className="mt-2 font-brand text-fp-small text-brand-secondary">{S.vlogs.cardSub}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionShell>
      </Scroll3DSection>

      <Scroll3DSection className="py-20 md:py-28">
        <SectionShell
          eyebrow={S.certifications.eyebrow}
          title={S.certifications.title}
          footer={
            <Link href="/certifications" className="inline-flex font-brand text-fp-small font-semibold text-brand-tertiary hover:underline">
              {S.certifications.footerLink} {S.certifications.arrow}
            </Link>
          }
        >
          {certifications.length === 0 ? (
            <p className="font-brand text-brand-secondary">{S.certifications.empty}</p>
          ) : (
            <div className="flex flex-wrap gap-4 md:gap-5">
              {certifications.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href={c.href}
                  className="card-3d-tilt rounded-full border border-brand-outline-soft/40 bg-brand-white/90 px-6 py-3 font-brand text-fp-small font-medium text-brand-fg hover:border-brand-tertiary/60 hover:text-brand-tertiary"
                >
                  {c.title}
                </Link>
              ))}
            </div>
          )}
        </SectionShell>
      </Scroll3DSection>

      <Scroll3DSection className="marketing-grid-bg pb-24 pt-16 md:pb-36 md:pt-24">
        <SectionShell eyebrow={S.testimonials.eyebrow} title={S.testimonials.title} lead={undefined}>
          {testimonials.length === 0 ? (
            <p className="font-brand text-brand-secondary">{S.testimonials.empty}</p>
          ) : (
            <div className="grid gap-10 md:grid-cols-3">
              {testimonials.slice(0, 6).map((t) => (
                <blockquote
                  key={t.id}
                  className="card-3d-tilt rounded-lg border border-brand-outline-soft/30 bg-brand-white/92 p-8 shadow-[0_26px_60px_-32px_rgb(11_28_48_/0.5)] backdrop-blur-sm"
                >
                  <p className="font-brand-accent text-fp-body font-light italic leading-relaxed text-brand-muted">&ldquo;{t.quote}&rdquo;</p>
                  <footer className="mt-6 font-brand-mono text-fp-tag font-medium uppercase text-brand-tertiary">
                    {S.testimonials.attributionSeparator}
                    {t.authorName}
                  </footer>
                </blockquote>
              ))}
            </div>
          )}
        </SectionShell>
      </Scroll3DSection>

      <Scroll3DSection className="border-t border-brand-outline-soft/25 bg-brand-fg pb-28 pt-20 text-brand-bg md:pb-36 md:pt-28">
        <div className="mx-auto max-w-content px-page-x md:px-page-x-md">
          <p className="font-brand text-fp-small font-semibold uppercase text-brand-bg/72">{S.finalCta.eyebrow}</p>
          <h2 className="font-brand-display text-fp-section mt-6 max-w-3xl font-bold">{S.finalCta.title}</h2>
          <p className="mt-8 max-w-2xl font-brand text-fp-hero-sub leading-[1.75] text-brand-bg/82">{S.finalCta.body}</p>
          <div className="mt-14 flex flex-wrap gap-5">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 bg-brand-bg px-8 py-4 font-brand text-fp-button font-semibold uppercase text-brand-fg transition-opacity hover:opacity-92"
            >
              {S.finalCta.primary} <IconArrow className="h-4 w-4 text-brand-fg" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 border border-brand-bg/55 px-8 py-4 font-brand text-fp-button font-semibold uppercase text-brand-bg transition-colors hover:bg-brand-bg/10"
            >
              {S.finalCta.secondary}
            </Link>
          </div>
        </div>
      </Scroll3DSection>
    </>
  );
}

function FeaturedProjectCard({
  item,
  emphasize,
  copy,
}: {
  item: Item;
  emphasize?: boolean;
  copy: (typeof content)["landing"]["sections"]["projects"];
}) {
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden border border-brand-outline-soft/35 bg-brand-white/95 p-9 shadow-[0_28px_80px_-40px_rgb(11_28_48_/0.55)] md:p-12 ${emphasize ? "min-h-[24rem]" : ""}`}
    >
      <div className="relative z-10 flex flex-1 flex-col">
        <span className="inline-flex w-max rounded-full bg-brand-surface px-3 py-1 font-brand-mono text-fp-tag font-semibold uppercase text-brand-muted">{copy.flagshipBadge}</span>
        <h3 className="font-brand-display text-fp-sub mt-8 font-bold text-brand-fg">{item.title}</h3>
        <p className="mt-5 max-w-xl flex-1 font-brand text-fp-body leading-relaxed text-brand-secondary">{item.blurb}</p>
        <Link href={item.href} className="mt-10 inline-flex w-max items-center gap-2 font-brand text-fp-small font-semibold text-brand-tertiary hover:underline">
          {copy.cardCta} <IconArrow className="h-4 w-4" />
        </Link>
      </div>
      <div
        className="pointer-events-none absolute -bottom-24 -right-16 h-[55%] w-[72%] opacity-[0.12] blur-px"
        style={{
          background: "radial-gradient(circle at 30% 30%, rgb(0 101 145), transparent 60%)",
        }}
      />
    </div>
  );
}

function CompactCard({ item, copy }: { item: Item; copy: (typeof content)["landing"]["sections"]["projects"] }) {
  const arrow = content.landing.sections.repos.arrow;
  return (
    <article className="flex h-full flex-col border border-brand-outline-soft/35 bg-brand-white/92 p-8 shadow-inner backdrop-blur-sm">
      <h3 className="font-brand-display text-fp-card font-bold text-brand-fg">{item.title}</h3>
      <p className="mt-4 line-clamp-4 flex-1 font-brand text-fp-small leading-relaxed text-brand-secondary">{item.blurb}</p>
      <Link href={item.href} className="mt-8 inline-flex font-brand text-fp-small font-semibold text-brand-tertiary hover:underline">
        {copy.compactCta} {arrow}
      </Link>
    </article>
  );
}
