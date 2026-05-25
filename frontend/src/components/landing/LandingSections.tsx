"use client";

import { SlugHoverGridCard } from "@/components/card";
import Image from "next/image";
import Link from "next/link";
import { content } from "@/lib/content-registry";
import { Scroll3DSection } from "./Scroll3DSection";
import { assetUrl } from "@/api/client";

const { landing: L, profile: P } = content;

type Item = {
  id: string;
  title: string;
  blurb: string;
  href: string;
  image?: string;
  video?: string;
};

type Repo = { id: string; name: string; url: string };

export type LandingSectionsProps = {
  projects: Item[];
  caseStudies: Item[];
  repos: Repo[];
  vlogs: Item[];
  certifications: Item[];
  testimonials: { id: string; authorName: string; quote: string; image?: string }[];
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- passed from home; repos block is commented out
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              {projects.slice(0, 6).map((p, i) => (
                <SlugHoverGridCard
                  key={p.id}
                  href={p.href}
                  title={p.title}
                  description={p.blurb}
                  imageUrl={p.image}
                  videoUrl={p.video}
                  delay={Math.min(i * 0.05, 0.28)}
                  imagePriority={i === 0}
                />
              ))}
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
          {caseStudies.length === 0 ? (
            <p className="font-brand text-brand-secondary">{S.caseStudies.empty}</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
              {caseStudies.slice(0, 6).map((c, i) => (
                <SlugHoverGridCard
                  key={c.id}
                  href={c.href}
                  title={c.title}
                  description={c.blurb}
                  imageUrl={c.image}
                  delay={Math.min(i * 0.05, 0.3)}
                />
              ))}
            </div>
          )}
        </SectionShell>
      </Scroll3DSection>

      {/* <Scroll3DSection className="py-20 md:py-28">
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
      </Scroll3DSection> */}

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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              {vlogs.slice(0, 6).map((v, i) => (
                <SlugHoverGridCard
                  key={v.id}
                  href={v.href}
                  title={v.title}
                  description={v.blurb}
                  imageUrl={v.image}
                  videoUrl={v.video}
                  delay={Math.min(i * 0.05, 0.3)}
                />
              ))}
            </div>
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              {certifications.slice(0, 6).map((c, i) => (
                <SlugHoverGridCard
                  key={c.id}
                  href={c.href}
                  title={c.title}
                  description={c.blurb}
                  imageUrl={c.image}
                  delay={Math.min(i * 0.045, 0.28)}
                />
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
            <div className="columns-1 gap-x-10 [column-gap:2.25rem] md:columns-2 lg:columns-3">
              {testimonials.slice(0, 6).map((t) => {
                const img = t.image ? assetUrl(t.image) : null;
                return (
                  <blockquote
                    key={t.id}
                    className="card-3d-tilt mb-8 break-inside-avoid rounded-2xl border border-brand-outline-soft/25 bg-brand-white/[0.93] shadow-[0_30px_70px_-42px_rgb(11_28_48_/0.52)]"
                  >
                    {img ? (
                      <div className="relative aspect-[16/11] bg-brand-muted/10">
                        <Image src={img} alt="" fill className="object-cover" sizes="360px" unoptimized />
                      </div>
                    ) : (
                      <div className="h-28 bg-gradient-to-br from-brand-tertiary/15 to-brand-bg" />
                    )}
                    <div className="space-y-5 p-9">
                      <p className="font-brand-accent text-fp-body font-light italic leading-relaxed text-brand-muted">&ldquo;{t.quote}&rdquo;</p>
                      <footer className="flex items-center gap-3 border-t border-brand-outline-soft/30 pt-5 font-brand-mono text-fp-tag font-medium uppercase tracking-[0.06em] text-brand-tertiary">
                        <span className="h-px flex-1 bg-brand-outline-soft/40" aria-hidden />
                        {t.authorName}
                      </footer>
                    </div>
                  </blockquote>
                );
              })}
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
