import Link from "next/link";

export function BrandMain({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`mx-auto w-full max-w-3xl px-5 pb-20 pt-10 font-brand text-fp-body text-brand-muted leading-relaxed md:max-w-4xl md:pb-28 md:pt-14 ${className}`}
    >
      {children}
    </div>
  );
}

/** Top-of-page breadcrumb/back link. */
export function BrandBack({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-block font-brand-mono text-fp-tag uppercase text-brand-secondary transition-colors hover:text-brand-fg"
    >
      {children}
    </Link>
  );
}

/** Primary page heading (listing + detail). */
export function BrandH1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-brand-display text-fp-section mt-10 font-bold text-brand-fg">
      {children}
    </h1>
  );
}

export function BrandLead({ children }: { children: React.ReactNode }) {
  return <p className="font-brand mt-6 max-w-2xl font-light text-fp-body leading-[1.75] text-brand-secondary">{children}</p>;
}

export function BrandList({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <ul className={`mt-12 space-y-5 ${className}`}>{children}</ul>;
}

export function BrandListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="brand-card p-6 transition-colors duration-300 hover:border-brand-outline-soft/50">{children}</li>
  );
}

export function BrandListLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="font-brand text-[15px] font-semibold uppercase tracking-[0.08em] text-brand-fg transition-colors hover:text-brand-tertiary">
      {children}
    </Link>
  );
}

export function BrandMuted({ children }: { children: React.ReactNode }) {
  return <p className="mt-12 text-[14px] text-brand-secondary/80">{children}</p>;
}

export function BrandExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="brand-link font-brand-mono text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px]">
      {children}
    </a>
  );
}

export function BrandInlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="brand-link text-sm">
      {children}
    </a>
  );
}
