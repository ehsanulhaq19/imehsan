import Link from "next/link";
import { content } from "@/lib/content-registry";

export function SiteFooter() {
  const y = new Date().getFullYear();
  const { site, profile } = content;
  const wl = site.footer.links;

  return (
    <footer className="mx-auto mt-24 w-full max-w-content border-t border-brand-outline-soft/25 bg-brand-surface-low px-page-x pb-16 pt-16 md:px-page-x-md">
      <div className="flex flex-col items-start justify-between gap-12 md:flex-row md:gap-16">
        <div className="max-w-sm">
          <div className="font-brand-display text-fp-sub font-bold text-brand-fg">{site.brandWordmark}</div>
          <p className="mt-4 font-brand text-[15px] leading-relaxed text-brand-secondary">{profile.summary}</p>
        </div>
        <div className="flex flex-wrap gap-x-14 gap-y-10">
          <div className="flex flex-col gap-3">
            <span className="font-brand text-[12px] font-bold uppercase tracking-[0.22em] text-brand-fg">{site.footer.exploreHeading}</span>
            <Link className="font-brand text-[15px] text-brand-secondary transition-colors hover:text-brand-tertiary" href="/projects">
              {wl.projects}
            </Link>
            <Link className="font-brand text-[15px] text-brand-secondary transition-colors hover:text-brand-tertiary" href="/case-studies">
              {wl.caseStudies}
            </Link>
            <Link className="font-brand text-[15px] text-brand-secondary transition-colors hover:text-brand-tertiary" href="/git-repos">
              {wl.research}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-brand text-[12px] font-bold uppercase tracking-[0.22em] text-brand-fg">{site.footer.connectHeading}</span>
            <Link className="font-brand text-[15px] text-brand-secondary transition-colors hover:text-brand-tertiary" href="/booking">
              {wl.booking}
            </Link>
            <Link className="font-brand text-[15px] text-brand-secondary transition-colors hover:text-brand-tertiary" href="/about">
              {wl.about}
            </Link>
            <Link className="font-brand text-[15px] text-brand-secondary transition-colors hover:text-brand-tertiary" href="/certifications">
              {wl.certifications}
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-14 border-t border-brand-outline-soft/20 pt-8 font-brand text-[13px] text-brand-secondary">
        © {y} {profile.name}. {site.footer.copyrightSuffix}
      </div>
    </footer>
  );
}
