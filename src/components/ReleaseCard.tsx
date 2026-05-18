import { ExternalLink, ShieldCheck, ShieldQuestion } from "lucide-react";
import { Link } from "react-router-dom";
import { buildBluRaySearchUrl } from "../providers/bluRayDotCom";
import type { CollectionItem } from "../types";

export function ValidationBadge({ status }: { status: string }) {
  const confirmed = status === "confirmed" || status === "manual";
  return (
    <span className={`badge ${confirmed ? "bg-emerald-400/15 text-vault-green" : "bg-amber-300/15 text-vault-gold"}`}>
      {confirmed ? <ShieldCheck size={13} /> : <ShieldQuestion size={13} />}
      <span className="ml-1">{status}</span>
    </span>
  );
}

export function ReleaseCard({ item }: { item: CollectionItem }) {
  return (
    <article className="surface overflow-hidden">
      <Link to={`/release/${item.id}`} className="block">
        <div className="aspect-[2/3] bg-vault-panel2">
          {item.posterUrl ? (
            <img src={item.posterUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-vault-muted">No poster</div>
          )}
        </div>
      </Link>
      <div className="space-y-3 p-3">
        <div>
          <Link to={`/release/${item.id}`} className="font-semibold hover:text-vault-cyan">
            {item.title}
          </Link>
          <div className="text-sm text-vault-muted">{[item.year, item.editionName, item.labelOrDistributor].filter(Boolean).join(" · ")}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="badge bg-vault-cyan/15 text-vault-cyan">4K UHD</span>
          {item.hdrFormats.slice(0, 2).map((format) => (
            <span key={format} className="badge bg-vault-gold/15 text-vault-gold">
              {format}
            </span>
          ))}
          {item.audioFormats.slice(0, 1).map((format) => (
            <span key={format} className="badge bg-sky-400/15 text-sky-300">
              {format}
            </span>
          ))}
          <ValidationBadge status={item.validationStatus} />
        </div>
        <div className="flex gap-2">
          <Link className="btn flex-1" to={`/release/${item.id}`}>
            Details
          </Link>
          <a className="btn" href={buildBluRaySearchUrl(item.title, item.year)} target="_blank" rel="noreferrer" title="Search Blu-ray.com">
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </article>
  );
}
