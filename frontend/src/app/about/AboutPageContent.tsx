"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BrandBack } from "@/components/brand/BrandPage";
import { portfolio } from "@/lib/portfolio";
import cv from "@/data/cv.json";

const easeOut = [0.22, 1, 0.36, 1] as const;

const staggerWrap = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

const timelineItem = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

export function AboutPageContent() {
  const reduce = useReducedMotion();
  const pi = cv.personal_info;
  const transitions = reduce ? { duration: 0 } : { duration: 0.52, ease: easeOut };

  const skillColumns: { label: string; items: string[] }[] = [
    { label: "Frontend", items: cv.skills.frontend.slice(0, 8) },
    { label: "Backend", items: cv.skills.backend.slice(0, 8) },
    { label: "AI & data", items: [...cv.skills.ai_engineering.slice(0, 5), ...cv.skills.databases.slice(0, 4)] },
    { label: "Cloud & delivery", items: cv.skills.cloud_devops.slice(0, 8) },
  ];

  return (
    <div className="relative overflow-hidden bg-brand-bg">
      <div
        className="pointer-events-none absolute -left-[20%] top-0 h-[min(70vh,540px)] w-[min(85vw,620px)] rounded-full bg-brand-tertiary/[0.07] blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-[10%] bottom-[10%] h-[min(50vh,420px)] w-[min(70vw,520px)] rounded-full bg-brand-fg/[0.04] blur-[90px]"
        aria-hidden
      />

      <motion.div
        className="relative mx-auto max-w-content px-page-x pb-28 pt-10 md:px-page-x-md md:pb-36 md:pt-14"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.4 }}
      >
        <BrandBack href="/">← Overview</BrandBack>
        <p className="font-brand-mono mt-4 text-fp-tag font-semibold uppercase tracking-[0.22em] text-brand-tertiary">About</p>

        <header className="relative mt-10 max-w-4xl">
          <motion.h1
            className="font-brand-display text-[clamp(2.1rem,5.2vw,3.25rem)] font-extrabold leading-[1.06] text-brand-fg"
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions, delay: reduce ? 0 : 0.05 }}
          >
            {pi.name}
          </motion.h1>
          <motion.p
            className="mt-4 max-w-2xl font-brand text-fp-hero-sub font-medium leading-relaxed text-brand-secondary"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions, delay: reduce ? 0 : 0.12 }}
          >
            {portfolio.summary}
          </motion.p>
          <motion.div
            className="mt-7 flex flex-wrap gap-2"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions, delay: reduce ? 0 : 0.18 }}
          >
            {pi.title.map((t) => (
              <span
                key={t}
                className="rounded-full border border-brand-outline-soft/45 bg-brand-bg/80 px-4 py-2 font-brand-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-fg/95 shadow-sm backdrop-blur-sm"
              >
                {t}
              </span>
            ))}
          </motion.div>
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 font-brand text-fp-small text-brand-secondary"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : 0.24, ...transitions }}
          >
            <span className="inline-flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-brand-tertiary" aria-hidden />
              {pi.location}
            </span>
            <a href={`mailto:${pi.email}`} className="brand-link font-semibold text-brand-fg underline-offset-4 hover:text-brand-tertiary">
              {pi.email}
            </a>
            <a
              href={pi.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="brand-link font-semibold text-brand-fg underline-offset-4 hover:text-brand-tertiary"
            >
              LinkedIn
            </a>
          </motion.div>
        </header>

        <motion.section
          className="mt-20 grid gap-5 sm:grid-cols-3"
          variants={staggerWrap}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-12% 0px" }}
        >
          <motion.div
            variants={fadeUp}
            className="rounded-2xl border border-brand-outline-soft/30 bg-brand-white/[0.55] px-7 py-8 shadow-[0_26px_70px_-40px_rgb(11_28_48_/0.45)] backdrop-blur-md dark:bg-brand-bg/65"
          >
            <p className="font-brand-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-muted">Trajectory</p>
            <p className="font-brand-display mt-3 text-fp-section font-bold text-brand-tertiary">{cv.professional_summary.experience_years}</p>
            <p className="mt-4 font-brand text-fp-small leading-relaxed text-brand-secondary">
              Years across web, mobile, and AI product delivery—from MVPs to high-traffic platforms.
            </p>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="rounded-2xl border border-brand-outline-soft/30 bg-brand-white/[0.55] px-7 py-8 shadow-[0_26px_70px_-40px_rgb(11_28_48_/0.45)] backdrop-blur-md dark:bg-brand-bg/65"
          >
            <p className="font-brand-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-muted">Breadth</p>
            <p className="font-brand-display mt-3 text-fp-card font-bold text-brand-fg">
              {cv.skills.business_domain_expertise.length}+ industries
            </p>
            <p className="mt-4 font-brand text-fp-small leading-relaxed text-brand-secondary">
              SaaS, commerce, logistics, healthcare, scheduling, CRM, and realtime communication systems.
            </p>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="rounded-2xl border border-brand-outline-soft/30 bg-brand-white/[0.55] px-7 py-8 shadow-[0_26px_70px_-40px_rgb(11_28_48_/0.45)] backdrop-blur-md dark:bg-brand-bg/65"
          >
            <p className="font-brand-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-muted">Positioning</p>
            <p className="font-brand-display mt-3 text-fp-card font-bold leading-snug text-brand-fg">{cv.career_identity.primary_positioning}</p>
            <p className="mt-4 font-brand text-fp-small leading-relaxed text-brand-secondary">
              Backend architecture, clouds, assistants, and the surfaces that stitch them together.
            </p>
          </motion.div>
        </motion.section>

        <motion.section
          className="mt-24 max-w-3xl"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={transitions}
        >
          <h2 className="font-brand-display text-fp-section font-bold text-brand-fg">Narrative</h2>
          <div className="mt-8 space-y-5 font-brand text-fp-body leading-[1.8] text-brand-secondary">
            <p>{cv.professional_summary.overview}</p>
            <p>
              Roles span freelance senior delivery through product companies—shipping AI assistants, realtime comms, commerce scale-ups, and
              cloud-backed services with disciplined SDLC habits.
            </p>
          </div>
          <motion.div className="mt-10 flex flex-wrap gap-2" variants={staggerWrap} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {cv.career_identity.secondary_positioning.map((role) => (
              <motion.span
                key={role}
                variants={fadeUp}
                className="rounded-md border border-brand-outline-soft/40 bg-brand-surface-low/70 px-3 py-2 font-brand text-[12px] font-semibold text-brand-fg"
              >
                {role}
              </motion.span>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className="mt-28"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={transitions}
        >
          <h2 className="font-brand-display text-fp-section font-bold text-brand-fg">Experience</h2>
          <p className="mt-5 max-w-2xl font-brand text-fp-body leading-relaxed text-brand-secondary">
            A condensed history—each chapter adds depth across stacks, domains, and production rigor.
          </p>
          <motion.ul className="relative mt-12 space-y-8 md:space-y-10" role="list" variants={staggerWrap} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-8% 0px" }}>
            {cv.experience.map((job) => (
              <motion.li key={`${job.company}-${job.duration}`} variants={timelineItem}>
                <div className="relative overflow-hidden rounded-2xl border border-brand-outline-soft/30 bg-brand-white/[0.5] pl-7 shadow-[0_20px_60px_-40px_rgb(11_28_48_/0.4)] backdrop-blur-sm md:pl-9 dark:bg-brand-bg/50">
                  <div className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-gradient-to-b from-brand-tertiary via-brand-tertiary/60 to-transparent" aria-hidden />
                  <div className="px-5 py-7 md:px-8 md:py-8">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <p className="font-brand-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-muted">{job.duration}</p>
                      {job.type ? (
                        <span className="rounded-full bg-brand-tertiary/12 px-2.5 py-0.5 font-brand-mono text-[10px] font-semibold uppercase tracking-wider text-brand-tertiary">
                          {job.type}
                        </span>
                      ) : null}
                      {job.location ? <span className="font-brand text-[12px] text-brand-muted">{job.location}</span> : null}
                    </div>
                    <p className="font-brand-display mt-3 text-fp-sub font-semibold text-brand-fg md:text-fp-card">
                      {job.role} · <span className="text-brand-tertiary">{job.company}</span>
                    </p>
                    <ul className="mt-5 list-none space-y-2.5 font-brand text-[14px] leading-relaxed text-brand-secondary">
                      {job.key_highlights.map((hi) => (
                        <li key={hi} className="flex gap-3">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-tertiary/75" aria-hidden />
                          <span>{hi}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </motion.section>

        <motion.section
          className="mt-28"
          initial={reduce ? false : { opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={transitions}
        >
          <h2 className="font-brand-display text-fp-section font-bold text-brand-fg">Capabilities map</h2>
          <p className="mt-5 max-w-2xl font-brand text-fp-body leading-relaxed text-brand-secondary">
            Stacks and primitives that recur across engagements—organized for skim reading, expanded in delivery.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {skillColumns.map((col) => (
              <motion.div
                key={col.label}
                className="rounded-xl border border-brand-outline-soft/25 bg-brand-surface-low/50 p-5 backdrop-blur-sm"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-5%" }}
              >
                <h3 className="font-brand-mono text-[10px] font-bold uppercase tracking-[0.22em] text-brand-tertiary">{col.label}</h3>
                <ul className="mt-4 space-y-2 font-brand text-[13px] leading-snug text-brand-secondary">
                  {col.items.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="mt-28"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={transitions}
        >
          <h2 className="font-brand-display text-fp-section font-bold text-brand-fg">Programmes & ships</h2>
          <p className="mt-5 font-brand text-fp-body text-brand-secondary">
            Highlights from shipped work—from AI SaaS to commerce and realtime platforms.
          </p>
          <motion.div className="mt-10 flex flex-wrap gap-3" variants={staggerWrap} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-5%" }}>
            {cv.projects.map((pr) => (
              <motion.div
                key={pr.name}
                variants={fadeUp}
                className="rounded-lg border border-brand-outline-soft/35 bg-brand-bg/80 px-4 py-3 shadow-sm backdrop-blur-sm"
              >
                <span className="font-brand-display text-[15px] font-semibold text-brand-fg">{pr.name}</span>
                <span className="mt-1 block font-brand text-[12px] text-brand-muted">{pr.category}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className="mt-28 rounded-3xl border border-brand-outline-soft/30 bg-brand-white/[0.45] p-10 shadow-inner backdrop-blur-md dark:bg-brand-fg/[0.04] md:p-14"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={transitions}
        >
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="font-brand-mono text-fp-tag font-bold uppercase tracking-[0.14em] text-brand-tertiary">Education</h2>
              <p className="font-brand-display mt-6 text-fp-sub font-bold text-brand-fg">{cv.education.degree}</p>
              <p className="mt-3 font-brand text-fp-body text-brand-secondary">{cv.education.institution}</p>
              <p className="mt-2 font-brand-mono text-fp-small uppercase tracking-[0.1em] text-brand-muted">{cv.education.duration}</p>
            </div>
          </div>
        </motion.section>

        <motion.footer
          className="mt-24 flex flex-col gap-5 border-t border-brand-outline-soft/25 pt-12 md:flex-row md:items-center md:justify-between"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 0.45 }}
        >
          <div>
            <p className="font-brand-display text-fp-card font-bold text-brand-fg">Continue exploring</p>
            <p className="mt-2 max-w-md font-brand text-fp-small text-brand-secondary">
              Dive into portfolio work or book time for architecture, AI rollout, or build planning.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/booking" className="inline-flex items-center justify-center rounded-sm bg-brand-fg px-7 py-3.5 font-brand text-fp-small font-semibold uppercase tracking-[0.08em] text-brand-bg transition-opacity hover:opacity-90">
              Book consultation
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-sm border border-brand-outline-soft/50 px-7 py-3.5 font-brand text-fp-small font-semibold uppercase tracking-[0.08em] text-brand-fg transition-colors hover:border-brand-tertiary hover:text-brand-tertiary"
            >
              View projects
            </Link>
          </div>
          <Link href="/" className="font-brand-mono text-fp-tag uppercase text-brand-secondary underline-offset-[6px] hover:text-brand-fg hover:underline md:hidden">
            Back to overview
          </Link>
        </motion.footer>
      </motion.div>
    </div>
  );
}
