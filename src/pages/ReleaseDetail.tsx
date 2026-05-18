import { CalendarCheck, ExternalLink, Save, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RatingInput } from "../components/RatingInput";
import { ValidationBadge } from "../components/ReleaseCard";
import { collectionToJson } from "../lib/importExport";
import { buildBluRaySearchUrl } from "../providers/bluRayDotCom";
import { useCollection } from "../hooks/useCollection";
import type { CollectionItem } from "../types";

export function ReleaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, save, remove } = useCollection();
  const item = items.find((entry) => entry.id === id);
  const similarOwned = useMemo(
    () => items.filter((entry) => entry.id !== id && entry.owned && entry.genres?.some((genre) => item?.genres?.includes(genre))).slice(0, 5),
    [id, item?.genres, items]
  );

  if (!item) {
    return <div className="surface p-6">Release not found. <Link className="text-vault-cyan" to="/collection">Back to collection</Link></div>;
  }
  const currentItem = item;

  async function update(patch: Partial<CollectionItem>) {
    await save({ ...currentItem, ...patch, userEditedFields: Array.from(new Set([...(currentItem.userEditedFields ?? []), ...Object.keys(patch)])) });
  }

  function exportItem() {
    const blob = new Blob([collectionToJson([currentItem])], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentItem.title.replace(/\W+/g, "-").toLowerCase()}-4k-vault.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <section className="surface overflow-hidden">
        <div className="min-h-56 bg-vault-panel2 bg-cover bg-center" style={item.backdropUrl ? { backgroundImage: `linear-gradient(90deg, rgba(8,11,18,.9), rgba(8,11,18,.35)), url(${item.backdropUrl})` } : undefined}>
          <div className="grid gap-5 p-5 md:grid-cols-[180px_1fr]">
            <div className="aspect-[2/3] overflow-hidden rounded-lg border border-vault-line bg-vault-panel">
              {item.posterUrl ? <img src={item.posterUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-vault-muted">No poster</div>}
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <ValidationBadge status={item.validationStatus} />
                <span className="badge bg-vault-cyan/15 text-vault-cyan">{item.format}</span>
                {item.wishlist && <span className="badge bg-pink-400/15 text-pink-300">Wishlist</span>}
              </div>
              <h1 className="text-3xl font-bold">{item.title} {item.year ? `(${item.year})` : ""}</h1>
              <p className="max-w-3xl text-vault-muted">{item.synopsis || "No synopsis stored yet."}</p>
              <div className="flex flex-wrap gap-2">
                {[...item.hdrFormats, ...item.audioFormats, item.packaging, item.boutiqueLabel].filter(Boolean).map((badge) => (
                  <span className="badge bg-vault-panel text-vault-text" key={badge}>{badge}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-primary" onClick={() => void update({ watchedStatus: "watched", watchHistory: [...item.watchHistory, { watchedAt: new Date().toISOString() }] })}>
                  <CalendarCheck size={16} /> Mark watched
                </button>
                <button className="btn" onClick={() => void update({ watchedStatus: "rewatch", watchHistory: [...item.watchHistory, { watchedAt: new Date().toISOString(), notes: "Rewatch" }] })}>Add rewatch</button>
                <a className="btn" href={buildBluRaySearchUrl(item.title, item.year)} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Search Blu-ray.com</a>
                <button className="btn" onClick={exportItem}>Export item</button>
                <button className="btn" onClick={() => void remove(item.id).then(() => navigate("/collection"))}><Trash2 size={16} /> Delete</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="surface space-y-4 p-4">
          <h2 className="text-xl font-semibold">Release metadata</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Detail label="UPC/EAN/GTIN" value={item.upc ?? item.ean ?? item.gtin} />
            <Detail label="ASIN" value={item.asin} />
            <Detail label="Edition" value={item.editionName ?? item.releaseTitle} />
            <Detail label="Label/distributor" value={item.labelOrDistributor ?? item.studio} />
            <Detail label="Country/region" value={[item.country, item.region].filter(Boolean).join(" / ")} />
            <Detail label="Release date" value={item.releaseDate} />
            <Detail label="Shelf" value={item.shelfLocation} />
            <Detail label="Purchase" value={[item.retailer, item.purchasePrice ? `$${item.purchasePrice}` : undefined].filter(Boolean).join(" · ")} />
            <Detail label="Loaned to" value={item.loanedTo} />
            <Detail label="Blu-ray.com" value={item.bluRayDotComUrl} href={item.bluRayDotComUrl} />
          </div>
          <label className="block">
            <span className="mb-1 block text-sm text-vault-muted">Notes</span>
            <textarea className="field min-h-28" value={item.notes ?? ""} onChange={(event) => void update({ notes: event.target.value })} />
          </label>
        </div>
        <div className="surface space-y-4 p-4">
          <h2 className="text-xl font-semibold">Ratings</h2>
          <RatingInput label="Overall release" value={item.personalRating} onChange={(value) => void update({ personalRating: value })} />
          <RatingInput label="Movie" value={item.movieRating} onChange={(value) => void update({ movieRating: value })} />
          <RatingInput label="Video transfer" value={item.videoTransferRating} onChange={(value) => void update({ videoTransferRating: value })} />
          <RatingInput label="Audio mix" value={item.audioMixRating} onChange={(value) => void update({ audioMixRating: value })} />
          <RatingInput label="Extras" value={item.extrasRating} onChange={(value) => void update({ extrasRating: value })} />
          <RatingInput label="Packaging" value={item.packagingRating} onChange={(value) => void update({ packagingRating: value })} />
          <button className="btn w-full" onClick={() => void update({ owned: true, wishlist: false })}><Save size={16} /> Move to owned</button>
        </div>
      </section>
      <section className="surface p-4">
        <h2 className="text-xl font-semibold">Validation</h2>
        <p className="mt-1 text-sm text-vault-muted">{item.validationConfidence}% confidence</p>
        <ul className="mt-3 list-inside list-disc text-sm text-vault-muted">
          {item.validationReasons.map((reason) => <li key={reason}>{reason}</li>)}
          {item.validationWarnings.map((warning) => <li key={warning} className="text-vault-gold">{warning}</li>)}
        </ul>
      </section>
      <section className="surface p-4">
        <h2 className="text-xl font-semibold">Similar owned titles</h2>
        <p className="mt-2 text-sm text-vault-muted">{similarOwned.map((entry) => entry.title).join(", ") || "Add genre metadata to discover similar owned titles."}</p>
      </section>
    </div>
  );
}

function Detail({ label, value, href }: { label: string; value?: string; href?: string }) {
  return (
    <div>
      <div className="text-xs uppercase text-vault-muted">{label}</div>
      {href && value ? <a className="break-words text-vault-cyan" href={href} target="_blank" rel="noreferrer">{value}</a> : <div>{value || "-"}</div>}
    </div>
  );
}
