import { Grid2X2, List, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ReleaseCard, ValidationBadge } from "../components/ReleaseCard";
import { useCollection } from "../hooks/useCollection";
import type { CollectionItem } from "../types";

type SortMode = "title" | "releaseDate" | "dateAdded" | "recentlyWatched" | "personalRating" | "purchasePrice" | "runtime" | "unwatched" | "random";

function searchableText(item: CollectionItem): string {
  return [
    item.title,
    item.originalTitle,
    item.director?.join(" "),
    item.cast?.join(" "),
    item.labelOrDistributor,
    item.studio,
    item.boutiqueLabel,
    item.hdrFormats.join(" "),
    item.audioFormats.join(" "),
    item.tags.join(" "),
    item.shelfLocation,
    item.upc,
    item.ean,
    item.gtin,
    item.asin
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function Collection() {
  const { items } = useCollection();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<SortMode>("title");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const next = items.filter((item) => {
      if (filter === "owned" && !item.owned) return false;
      if (filter === "wishlist" && !item.wishlist) return false;
      if (filter === "watched" && item.watchedStatus === "unwatched") return false;
      if (filter === "unwatched" && item.watchedStatus !== "unwatched") return false;
      if (filter === "dolbyVision" && !item.hdrFormats.includes("Dolby Vision")) return false;
      if (filter === "atmos" && !item.audioFormats.includes("Dolby Atmos")) return false;
      if (filter === "steelbook" && item.packaging !== "steelbook") return false;
      if (filter === "unverified" && !["unverified", "rejected"].includes(item.validationStatus)) return false;
      return q ? searchableText(item).includes(q) : true;
    });
    return next.sort((a, b) => sortCollection(a, b, sort));
  }, [filter, items, query, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Collection</h1>
          <p className="text-sm text-vault-muted">Search physical 4K releases by title, barcode, people, labels, formats, tags, and shelf location.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => setView("grid")} title="Poster grid">
            <Grid2X2 size={16} />
          </button>
          <button className="btn" onClick={() => setView("table")} title="Compact table">
            <List size={16} />
          </button>
        </div>
      </div>
      <div className="surface grid gap-3 p-4 md:grid-cols-[1fr_180px_180px]">
        <input className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, UPC, ASIN, director, actor, label, HDR, audio, tag..." />
        <select className="field" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">All releases</option>
          <option value="owned">Owned</option>
          <option value="wishlist">Wishlist</option>
          <option value="watched">Watched</option>
          <option value="unwatched">Unwatched</option>
          <option value="dolbyVision">Dolby Vision</option>
          <option value="atmos">Dolby Atmos</option>
          <option value="steelbook">Steelbook</option>
          <option value="unverified">Unverified</option>
        </select>
        <select className="field" value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
          <option value="title">Title</option>
          <option value="releaseDate">Release date</option>
          <option value="dateAdded">Date added</option>
          <option value="recentlyWatched">Recently watched</option>
          <option value="personalRating">Personal rating</option>
          <option value="purchasePrice">Purchase price</option>
          <option value="runtime">Runtime</option>
          <option value="unwatched">Unwatched first</option>
          <option value="random">Random</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="surface p-8 text-center text-vault-muted">No matching physical 4K releases.</div>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">{filtered.map((item) => <ReleaseCard key={item.id} item={item} />)}</div>
      ) : (
        <div className="surface overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-vault-line text-vault-muted">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Edition</th>
                <th className="p-3">Label</th>
                <th className="p-3">Formats</th>
                <th className="p-3">Watched</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Validation</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-vault-line/70">
                  <td className="p-3">
                    <Link className="font-semibold hover:text-vault-cyan" to={`/release/${item.id}`}>
                      {item.title} {item.year ? `(${item.year})` : ""}
                    </Link>
                  </td>
                  <td className="p-3">{item.editionName ?? "-"}</td>
                  <td className="p-3">{item.labelOrDistributor ?? item.studio ?? "-"}</td>
                  <td className="p-3">{[...item.hdrFormats, ...item.audioFormats].join(", ") || "-"}</td>
                  <td className="p-3">{item.watchedStatus}</td>
                  <td className="p-3">{item.personalRating || "-"}</td>
                  <td className="p-3"><ValidationBadge status={item.validationStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {sort === "random" && (
        <p className="flex items-center gap-2 text-sm text-vault-muted">
          <Shuffle size={14} /> Random sorting reshuffles when the list recomputes.
        </p>
      )}
    </div>
  );
}

function sortCollection(a: CollectionItem, b: CollectionItem, sort: SortMode): number {
  if (sort === "random") return Math.random() - 0.5;
  if (sort === "releaseDate") return (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "");
  if (sort === "dateAdded") return b.dateAdded.localeCompare(a.dateAdded);
  if (sort === "recentlyWatched") return (b.watchHistory.at(-1)?.watchedAt ?? "").localeCompare(a.watchHistory.at(-1)?.watchedAt ?? "");
  if (sort === "personalRating") return b.personalRating - a.personalRating;
  if (sort === "purchasePrice") return (b.purchasePrice ?? 0) - (a.purchasePrice ?? 0);
  if (sort === "runtime") return (b.runtime ?? 0) - (a.runtime ?? 0);
  if (sort === "unwatched") return Number(a.watchedStatus !== "unwatched") - Number(b.watchedStatus !== "unwatched");
  return a.sortTitle.localeCompare(b.sortTitle);
}
