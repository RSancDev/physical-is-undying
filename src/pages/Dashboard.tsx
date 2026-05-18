import { Dice5, Film, Heart, Star, Wallet, Watch } from "lucide-react";
import { Link } from "react-router-dom";
import { ReleaseCard } from "../components/ReleaseCard";
import { StatCard } from "../components/StatCard";
import { collectionStats } from "../lib/stats";
import { useCollection } from "../hooks/useCollection";

export function Dashboard() {
  const { items } = useCollection();
  const stats = collectionStats(items);
  const owned = items.filter((item) => item.owned);
  const recentlyAdded = [...owned].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded)).slice(0, 4);
  const recentlyWatched = [...owned]
    .filter((item) => item.watchHistory.length > 0)
    .sort((a, b) => (b.watchHistory.at(-1)?.watchedAt ?? "").localeCompare(a.watchHistory.at(-1)?.watchedAt ?? ""))
    .slice(0, 4);
  const highestRated = [...owned].sort((a, b) => b.personalRating - a.personalRating).slice(0, 4);
  const oldestUnwatched = [...owned].filter((item) => item.watchedStatus === "unwatched").sort((a, b) => a.dateAdded.localeCompare(b.dateAdded));
  const randomPick = oldestUnwatched[Math.floor(Math.random() * Math.max(oldestUnwatched.length, 1))];

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Owned 4K releases" value={stats.ownedCount} icon={<Film size={18} />} />
        <StatCard label="Watched" value={stats.watchedCount} icon={<Watch size={18} />} />
        <StatCard label="Unwatched" value={stats.unwatchedCount} icon={<Dice5 size={18} />} />
        <StatCard label="Wishlist" value={stats.wishlistCount} icon={<Heart size={18} />} />
        <StatCard label="Collection value" value={`$${stats.totalValue.toFixed(2)}`} icon={<Wallet size={18} />} />
      </section>
      <section className="grid gap-3 md:grid-cols-4">
        <StatCard label="Avg personal" value={stats.averagePersonalRating || "-"} icon={<Star size={18} />} />
        <StatCard label="Avg movie" value={stats.averageMovieRating || "-"} icon={<Star size={18} />} />
        <StatCard label="Avg video transfer" value={stats.averageVideoTransferRating || "-"} icon={<Star size={18} />} />
        <StatCard label="Avg audio mix" value={stats.averageAudioMixRating || "-"} icon={<Star size={18} />} />
      </section>
      <section className="surface p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tonight pick</h1>
            <p className="text-sm text-vault-muted">Random unwatched physical 4K release from the shelf.</p>
          </div>
          {randomPick ? (
            <Link to={`/release/${randomPick.id}`} className="btn btn-primary">
              <Dice5 size={17} />
              {randomPick.title}
            </Link>
          ) : (
            <Link to="/add" className="btn btn-primary">
              Add first release
            </Link>
          )}
        </div>
      </section>
      <DashboardShelf title="Recently added" items={recentlyAdded} empty="Add a release to start the vault." />
      <DashboardShelf title="Recently watched" items={recentlyWatched} empty="Mark a disc watched to populate this shelf." />
      <DashboardShelf title="Highest rated releases" items={highestRated} empty="Rate releases to surface favorites." />
      <DashboardShelf title="Oldest unwatched" items={oldestUnwatched.slice(0, 4)} empty="No shame pile yet." />
    </div>
  );
}

function DashboardShelf({ title, items, empty }: { title: string; items: ReturnType<typeof useCollection>["items"]; empty: string }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      {items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map((item) => <ReleaseCard key={item.id} item={item} />)}</div>
      ) : (
        <div className="surface p-5 text-vault-muted">{empty}</div>
      )}
    </section>
  );
}
