import { fetchVlogsList } from "@/api/vlogs";
import { BrandBack, BrandH1, BrandListLink, BrandMain, BrandMuted } from "@/components/brand/BrandPage";

type Vlog = { id: string; slug: string; heading: string };

export default async function VlogsPage() {
  const list = await fetchVlogsList<Vlog[]>();
  return (
    <BrandMain>
      <BrandBack href="/">← Home</BrandBack>
      <BrandH1>Video logs</BrandH1>
      <ul className="mt-12 divide-y divide-brand-outline-soft/35">
        {(list ?? []).map((v) => (
          <li key={v.id} className="py-6 first:pt-0">
            <BrandListLink href={`/vlogs/${v.slug}`}>{v.heading}</BrandListLink>
          </li>
        ))}
      </ul>
      {!list?.length ? <BrandMuted>No vlogs published.</BrandMuted> : null}
    </BrandMain>
  );
}
