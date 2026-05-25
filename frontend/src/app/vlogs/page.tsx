import { fetchVlogsPage } from "@/api/vlogs";
import { BrandBack, BrandH1, BrandMain, BrandMuted } from "@/components/brand/BrandPage";
import { VlogsCardFeed } from "@/components/content/VlogsCardFeed";

export default async function VlogsPage() {
  const first = await fetchVlogsPage(1, 12);
  if (!first) {
    return (
      <BrandMain className="max-w-6xl">
        <BrandBack href="/">← Home</BrandBack>
        <BrandH1>Video logs</BrandH1>
        <BrandMuted>Could not load vlogs.</BrandMuted>
      </BrandMain>
    );
  }
  return (
    <BrandMain className="max-w-6xl">
      <BrandBack href="/">← Home</BrandBack>
      <BrandH1>Video logs</BrandH1>
      {!first.items.length ? <BrandMuted>No vlogs published.</BrandMuted> : <VlogsCardFeed initial={first} />}
    </BrandMain>
  );
}
