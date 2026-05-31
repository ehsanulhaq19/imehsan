"use client";

import { SlugHoverGridCard } from "@/components/card";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { content } from "@/lib/content-registry";
import { Scroll3DSection } from "./Scroll3DSection";
import { assetUrl } from "@/api/client";
import cv from "@/data/cv.json";
import { useEffect, useMemo, useState } from "react";

const { landing: L } = content;

type Item = {
  id: string;
  title: string;
  blurb: string;
  href: string;
  image?: string;
  video?: string;
};

type Repo = { id: string; name: string; url: string };

/** Rotating marketing backdrops keyed to each headline slide — swap URLs anytime */
const CV_HERO_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80",
] as const;

const aboutContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.06,
    },
  },
};

const aboutItem = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const trustReveal = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.055, delayChildren: 0.04 },
  },
};

const trustLine = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
  },
};

const trustChip = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.44, ease: [0.22, 1, 0.36, 1] },
  },
};

const trustChipWrap = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

const metricsStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.105, delayChildren: 0.07 },
  },
};

const metricCard = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
  },
};

export type LandingSectionsProps = {
  projects: Item[];
  caseStudies: Item[];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- passed from home; repos block is commented out
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

function buildCvHeroSlides() {
  const pi = cv.personal_info;
  const ps = cv.professional_summary;
  const ci = cv.career_identity;
  const sk = cv.skills;
  const overview = ps.overview.length > 300 ? `${ps.overview.slice(0, 297).trimEnd()}…` : ps.overview;
  return [
    {
      eyebrow: pi.title[0],
      title: pi.name,
      body: `${ci.primary_positioning} · ${pi.location}`,
    },
    {
      eyebrow: "Mobile engineering",
      title: pi.title[1],
      body: sk.mobile.slice(0, 4).join(" · "),
    },
    {
      eyebrow: "AI & intelligent products",
      title: pi.title[2],
      body: sk.ai_engineering.slice(0, 5).join(" · "),
    },
    {
      eyebrow: "How I work",
      title: "Designing systems that ship",
      body: overview,
    },
    {
      eyebrow: "Industry depth",
      title: "From logistics to healthcare",
      body: sk.business_domain_expertise.slice(0, 10).join(" · "),
    },
    {
      eyebrow: "Education & validation",
      title: cv.education.degree,
      body: `${cv.education.institution} (${cv.education.duration})`,
    },
  ];
}

function HeroPreviewFrame() {
  return (
    <div className="relative mx-auto w-full max-w-[min(92vw,20rem)] overflow-hidden md:max-w-[min(320px,28vw)]">
      <div className="pointer-events-none absolute inset-0 rounded-[1.35rem] bg-gradient-to-br from-brand-tertiary/50 via-transparent to-brand-fg/20 opacity-90 blur-xl" aria-hidden />
      <div className="relative overflow-hidden rounded-2xl border border-brand-outline/40 bg-brand-surface-low shadow-[0_28px_80px_-38px_rgb(11_28_48_/0.75)] ring-1 ring-brand-fg/5">
        <div className="flex aspect-[4/5] flex-col justify-between bg-gradient-to-b from-brand-muted/18 via-brand-bg/40 to-brand-surface-low px-6 py-7">
          <span className="font-brand-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-muted">Preview</span>
          <div>
            <p className="font-brand-display text-fp-small font-semibold leading-snug text-brand-fg/90">Portrait placeholder</p>
            <p className="mt-3 font-brand text-[13px] leading-relaxed text-brand-secondary">
              Drop your headshot here — swap this wrapper for{" "}
              <code className="rounded bg-brand-fg/[0.06] px-1.5 py-0.5 font-brand-mono text-[11px]">next/image</code> pointing at{" "}
              <code className="rounded bg-brand-fg/[0.06] px-1.5 py-0.5 font-brand-mono text-[11px]">/public/...</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CvMarketingHero({ intervalMs = 5600 }: { intervalMs?: number }) {
  const slides = useMemo(() => buildCvHeroSlides(), []);
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => {
      setIndex((j) => (j + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(t);
  }, [slides.length, intervalMs, reduce]);

  const active = slides[reduce ? 0 : index];

  return (
    <Scroll3DSection className="overflow-hidden pb-14 md:pb-20">
      <div className="relative flex min-h-[min(92svh,54rem)] items-center justify-start">
        <div className="absolute inset-0 z-0">
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={`bg-${reduce ? 0 : index}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote rotating hero */}
              <img
                alt=""
                className="h-full w-full object-cover scale-105 motion-reduce:scale-100"
                src={CV_HERO_BACKGROUNDS[reduce ? 0 : index]}
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/82 to-transparent md:via-brand-bg/70 lg:via-brand-bg/50" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-content px-page-x py-14 md:px-page-x-md md:py-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr,minmax(260px,34%)] lg:gap-16">
            <div className="min-h-[min(52vh,26rem)] max-w-[40rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={reduce ? "static" : index}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="font-brand-mono text-fp-tag font-semibold uppercase tracking-[0.12em] text-brand-tertiary">{active.eyebrow}</p>
                  <h1 className="font-brand-display mt-4 text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.08] text-brand-fg md:mt-5">{active.title}</h1>
                  <p className="mt-6 max-w-xl font-brand text-fp-hero-sub font-medium leading-[1.72] text-brand-secondary md:mt-7">{active.body}</p>
                </motion.div>
              </AnimatePresence>

              {!reduce ? (
                <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label="Hero highlights">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={i === index}
                      onClick={() => setIndex(i)}
                      className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                        i === index ? "w-8 bg-brand-tertiary" : "w-1.5 bg-brand-fg/25 hover:bg-brand-fg/40"
                      }`}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex justify-center lg:justify-end">
              <motion.div initial={false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <HeroPreviewFrame />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Scroll3DSection>
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
  const experienceYearsDisplay = cv.professional_summary.experience_years;
  const specializationMetric = `${cv.specializations.length}+`;
  const codeStacks = [...cv.skills.backend.slice(0, 5), ...cv.skills.ai_engineering.slice(0, 3)];

  return (
    <>
      <CvMarketingHero />

      <Scroll3DSection className="relative overflow-hidden border-y border-brand-outline-soft/20 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--brand-surface-low)_94%,transparent)_0%,var(--brand-bg)_42%,color-mix(in_oklab,var(--brand-surface-low)_88%,transparent)_100%)] py-16 md:py-[4.75rem]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-[56rem] bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--brand-tertiary)_12%,transparent),transparent)] py-36 opacity-[0.85]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-content px-page-x md:px-page-x-md">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px 0px" }} variants={trustReveal}>
            <motion.p variants={trustLine} className="text-center font-brand-mono text-fp-tag font-bold uppercase tracking-[0.26em] text-brand-tertiary">
              {L.trustStrip.label}
            </motion.p>
            {"lead" in L.trustStrip && typeof L.trustStrip.lead === "string" ? (
              <motion.p variants={trustLine} className="mx-auto mt-5 max-w-3xl text-center font-brand text-[15px] font-medium leading-relaxed tracking-tight text-brand-secondary md:text-[16px]">
                {L.trustStrip.lead}
              </motion.p>
            ) : null}
            <motion.div variants={trustChipWrap} className="mt-11 flex flex-wrap justify-center gap-3 md:mt-12 md:gap-3.5">
              {L.trustStrip.items.map((label) => (
                <motion.span
                  key={label}
                  variants={trustChip}
                  className="rounded-2xl border border-brand-outline-soft/35 bg-brand-white/[0.42] px-5 py-3 font-brand-display text-[13px] font-semibold uppercase tracking-[0.1em] text-brand-fg/95 shadow-[0_16px_40px_-30px_rgb(11_28_48_/0.55)] backdrop-blur-md md:px-[1.125rem] md:text-[13.5px] dark:bg-brand-bg/45"
                >
                  {label}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </Scroll3DSection>

      <Scroll3DSection className="relative py-[4.75rem] md:py-[5.75rem]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_50%_at_50%_18%,color-mix(in_oklab,var(--brand-tertiary)_7%,transparent),transparent)]" aria-hidden />
        <motion.div
          className="relative mx-auto grid max-w-content gap-8 px-page-x md:grid-cols-3 md:gap-7 lg:gap-10 md:px-page-x-md"
          variants={metricsStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-72px 0px" }}
        >
          {L.metrics.map((row, i) => {
            const v =
              row.valueKey === "experienceYears"
                ? experienceYearsDisplay
                : row.valueKey === "specializationCount"
                  ? specializationMetric
                  : (row.staticValue ?? "");
            return (
              <motion.article
                key={row.label}
                variants={metricCard}
                className="card-3d-tilt relative overflow-hidden rounded-[1.35rem] border border-brand-outline-soft/40 bg-brand-white/[0.68] px-8 py-10 shadow-[0_32px_80px_-42px_rgb(11_28_48_/_0.42)] backdrop-blur-md md:px-9 dark:bg-brand-bg/58"
              >
                <span className="font-brand-mono text-[11px] font-semibold uppercase tracking-[0.4em] text-brand-muted">{String(i + 1).padStart(2, "0")}</span>
                <p className="font-brand-display mt-7 text-[clamp(2rem,4vw,2.75rem)] font-extrabold leading-none tracking-tight text-brand-tertiary">{v}</p>
                <div className="pointer-events-none absolute -right-6 -top-12 h-[10rem] w-[10rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--brand-tertiary)_18%,transparent),transparent)] blur-3xl opacity-95" aria-hidden />
                <p className="relative mt-6 font-brand text-[15px] font-medium leading-[1.7] text-brand-secondary">{row.label}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </Scroll3DSection>

      <Scroll3DSection className="relative overflow-hidden bg-[radial-gradient(1200px_circle_at_-10%_-20%,color-mix(in_oklab,var(--brand-tertiary)_18%,transparent),transparent)] pb-24 md:pb-36">
        <div className="mx-auto grid max-w-content gap-16 px-page-x md:grid-cols-2 md:gap-20 md:px-page-x-md">
          <motion.div variants={aboutContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-12% 0px" }}>
            <motion.div variants={aboutItem}>
              <p className="font-brand-mono text-fp-tag font-semibold uppercase tracking-[0.14em] text-brand-tertiary">About</p>
              <h2 className="font-brand-display mt-5 text-fp-section font-bold leading-tight text-brand-fg md:mt-6">{cv.career_identity.primary_positioning}</h2>
              <p className="mt-6 font-brand text-fp-body leading-[1.75] text-brand-secondary">{cv.professional_summary.overview}</p>
            </motion.div>

            <motion.div variants={aboutItem} className="mt-10 flex flex-wrap gap-2">
              {cv.career_identity.secondary_positioning.map((role) => (
                <span
                  key={role}
                  className="rounded-full border border-brand-outline-soft/40 bg-brand-bg/65 px-3.5 py-1.5 font-brand text-[12px] font-semibold uppercase tracking-[0.08em] text-brand-fg/90 backdrop-blur-sm"
                >
                  {role}
                </span>
              ))}
            </motion.div>

          </motion.div>

          <motion.div
            className="relative min-h-[20rem]"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-tertiary/35 to-transparent blur-[110px]" />
            <div className="sticky top-24 z-10 overflow-hidden rounded-xl border border-brand-fg/10 bg-brand-white/[0.72] p-7 font-brand-mono text-[12px] leading-relaxed break-words text-brand-muted shadow-2xl backdrop-blur-xl [overflow-wrap:anywhere] md:p-8">
              <div className="mb-5 flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/55" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/55" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/55" />
              </div>
              <span className="text-brand-tertiary">class</span> <span className="text-blue-700">EngineerProfile</span>:<br />
              &nbsp;&nbsp;<span className="text-brand-tertiary">def</span> <span className="text-blue-700">__init__</span>(self):
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span className="text-neutral-700">
                self.anchor = &quot;{cv.personal_info.location}&quot;
              </span>
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span className="text-neutral-700">self.stack = [</span>
              <span className="text-emerald-800">{codeStacks.join(", ")}</span>
              <span className="text-neutral-700">]</span>
              <br />
              <br />
              &nbsp;&nbsp;<span className="text-brand-tertiary">def</span> <span className="text-blue-700">ship</span>(self, scope):
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span className="text-brand-tertiary">return</span>
              <span className="text-neutral-700"> microservices.llm.ready(scope)</span>
              <br />
              <br />
              profile = EngineerProfile()
              <br />
              profile.ship(scope=&quot;<span className="text-purple-900">SaaS · commerce · comms platforms</span>&quot;)
              <div className="pointer-events-none absolute bottom-3 right-3 select-none text-7xl font-bold text-brand-fg/[0.06]">✦</div>
            </div>
          </motion.div>
        </div>
      </Scroll3DSection>

      <Scroll3DSection className="border-t border-brand-outline-soft/25 bg-brand-surface-low py-16 md:py-20">
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
              {projects.slice(0, 6).map((p, i) => (
                <SlugHoverGridCard
                  key={p.id}
                  href={p.href}
                  title={p.title}
                  description={p.blurb}
                  imageUrl={p.image}
                  videoUrl={p.video}
                  density="compact"
                  delay={Math.min(i * 0.04, 0.22)}
                  imagePriority={i === 0}
                />
              ))}
            </div>
          )}
        </SectionShell>
      </Scroll3DSection>

      <Scroll3DSection className="marketing-grid-bg py-16 md:py-20">
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
              {caseStudies.slice(0, 6).map((c, i) => (
                <SlugHoverGridCard
                  key={c.id}
                  href={c.href}
                  title={c.title}
                  description={c.blurb}
                  imageUrl={c.image}
                  density="compact"
                  delay={Math.min(i * 0.04, 0.24)}
                />
              ))}
            </div>
          )}
        </SectionShell>
      </Scroll3DSection>

      {/* Repos section — uncomment to restore
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
      */}

      <Scroll3DSection className="border-y border-brand-outline-soft/20 bg-brand-surface-low py-16 md:py-20">
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
              {vlogs.slice(0, 6).map((v, i) => (
                <SlugHoverGridCard
                  key={v.id}
                  href={v.href}
                  title={v.title}
                  description={v.blurb}
                  imageUrl={v.image}
                  videoUrl={v.video}
                  density="compact"
                  delay={Math.min(i * 0.04, 0.24)}
                />
              ))}
            </div>
          )}
        </SectionShell>
      </Scroll3DSection>

      <Scroll3DSection className="py-16 md:py-24">
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
              {certifications.slice(0, 6).map((c, i) => (
                <SlugHoverGridCard key={c.id} href={c.href} title={c.title} description={c.blurb} imageUrl={c.image} density="compact" delay={Math.min(i * 0.04, 0.22)} />
              ))}
            </div>
          )}
        </SectionShell>
      </Scroll3DSection>

      <Scroll3DSection className="marketing-grid-bg pb-24 pt-14 md:pb-36 md:pt-20">
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
