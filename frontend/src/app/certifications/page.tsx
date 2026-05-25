import { fetchCertificationsPage } from "@/api/certifications";
import { BrandBack, BrandH1, BrandMain, BrandMuted } from "@/components/brand/BrandPage";
import { CertificationsCardFeed } from "@/components/content/CertificationsCardFeed";

export default async function CertificationsPage() {
  const first = await fetchCertificationsPage(1, 12);
  if (!first) {
    return (
      <BrandMain className="max-w-6xl">
        <BrandBack href="/">← Home</BrandBack>
        <BrandH1>Certifications</BrandH1>
        <BrandMuted>Could not load certifications.</BrandMuted>
      </BrandMain>
    );
  }
  return (
    <BrandMain className="max-w-6xl">
      <BrandBack href="/">← Home</BrandBack>
      <BrandH1>Certifications</BrandH1>
      {!first.items.length ? <BrandMuted>No certifications published yet.</BrandMuted> : <CertificationsCardFeed initial={first} />}
    </BrandMain>
  );
}
