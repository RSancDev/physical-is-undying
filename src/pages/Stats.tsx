import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatCard } from "../components/StatCard";
import { collectionStats, groupCount } from "../lib/stats";
import { useCollection } from "../hooks/useCollection";

export function Stats() {
  const { items } = useCollection();
  const stats = collectionStats(items);
  const owned = items.filter((item) => item.owned);
  const genreData = groupCount(owned, (item) => item.genres);
  const hdrData = groupCount(owned, (item) => item.hdrFormats);
  const packagingData = groupCount(owned, (item) => item.packaging);
  const ratingData = [1, 2, 3, 4, 5].map((rating) => ({ name: `${rating}`, value: owned.filter((item) => Math.round(item.personalRating) === rating).length }));
  const runtimeOwned = owned.reduce((sum, item) => sum + (item.runtime ?? 0), 0);
  const runtimeUnwatched = owned.filter((item) => item.watchedStatus === "unwatched").reduce((sum, item) => sum + (item.runtime ?? 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Stats</h1>
        <p className="text-sm text-vault-muted">Collection health, ratings, formats, spending, and runtime signals.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard label="Watched vs unwatched" value={`${stats.watchedCount}/${stats.unwatchedCount}`} />
        <StatCard label="Average purchase" value={`$${(stats.totalValue / Math.max(stats.ownedCount, 1)).toFixed(2)}`} />
        <StatCard label="Runtime owned" value={`${runtimeOwned}m`} />
        <StatCard label="Runtime unwatched" value={`${runtimeUnwatched}m`} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Chart title="Ratings distribution" data={ratingData} />
        <Chart title="Collection by genre" data={genreData.slice(0, 10)} />
        <Chart title="HDR format" data={hdrData} />
        <Chart title="Packaging" data={packagingData} />
      </div>
      <div className="surface p-4">
        <h2 className="text-xl font-semibold">Collection health</h2>
        <div className="mt-3 grid gap-2 text-sm text-vault-muted md:grid-cols-2">
          <Health label="Missing UPC" count={owned.filter((item) => !item.upc && !item.ean && !item.gtin).length} />
          <Health label="Missing TMDb ID" count={owned.filter((item) => !item.tmdbId).length} />
          <Health label="Missing Blu-ray.com URL" count={owned.filter((item) => !item.bluRayDotComUrl).length} />
          <Health label="Unverified 4K status" count={owned.filter((item) => ["unverified", "rejected"].includes(item.validationStatus)).length} />
          <Health label="Missing shelf location" count={owned.filter((item) => !item.shelfLocation).length} />
          <Health label="Missing ratings" count={owned.filter((item) => item.personalRating === 0).length} />
        </div>
      </div>
    </div>
  );
}

function Chart({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  return (
    <section className="surface p-4">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#273247" vertical={false} />
            <XAxis dataKey="name" stroke="#9aa6bb" />
            <YAxis stroke="#9aa6bb" allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #273247" }} />
            <Bar dataKey="value" fill="#36c5f0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function Health({ label, count }: { label: string; count: number }) {
  return <div className="flex justify-between border-b border-vault-line py-2"><span>{label}</span><strong className={count ? "text-vault-gold" : "text-vault-green"}>{count}</strong></div>;
}
