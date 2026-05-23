import Link from "next/link";
import { BrandBack, BrandH1, BrandLead, BrandMain } from "@/components/brand/BrandPage";
import { portfolio } from "@/lib/portfolio";

export default function AboutPage() {
  return (
    <BrandMain>
      <BrandBack href="/">← Overview</BrandBack>
      <p className="font-brand-mono text-[10px] uppercase tracking-[0.32em] text-brand-secondary sm:mt-2 sm:text-[11px]">/ about</p>
      <BrandH1>{portfolio.name}</BrandH1>
      <BrandLead>{portfolio.summary}</BrandLead>
      <ul className="mt-12 space-y-4 font-brand text-[14px] font-light leading-[1.75] text-brand-secondary">
        {portfolio.coreExpertise.slice(0, 10).map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
      <p className="mt-14 font-brand text-[13px] text-brand-muted/80">
        <Link href="/" className="brand-link underline-offset-8 hover:underline">
          Back to overview
        </Link>
      </p>
    </BrandMain>
  );
}
