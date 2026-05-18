import { ExternalLink, Heart, Sparkles } from "lucide-react";
import { useState } from "react";
import { itemFromCandidate } from "../lib/releaseFactory";
import { candidateRecommendations } from "../lib/recommendations";
import { buildBluRaySearchUrl } from "../providers/bluRayDotCom";
import { searchPhysicalByTitle } from "../providers/registry";
import { useCollection } from "../hooks/useCollection";
import type { MovieMetadataCandidate, PhysicalReleaseCandidate } from "../types";

export function Recommendations() {
  const { items, save } = useCollection();
  const [query, setQuery] = useState("");
  const [releaseCandidates, setReleaseCandidates] = useState<PhysicalReleaseCandidate[]>([]);
  const [busy, setBusy] = useState(false);
  const metadataCandidates: MovieMetadataCandidate[] = items
    .filter((item) => item.tmdbId)
    .map((item) => ({ id: item.tmdbId!, title: item.title, year: item.year, posterUrl: item.posterUrl, synopsis: item.synopsis }));
  const recommendations = candidateRecommendations(items, metadataCandidates, releaseCandidates);

  async function search() {
    setBusy(true);
    try {
      setReleaseCandidates(await searchPhysicalByTitle(query));
    } finally {
      setBusy(false);
    }
  }

  async function addWishlist(candidate: PhysicalReleaseCandidate) {
    await save(itemFromCandidate(candidate, { owned: false, wishlist: true }));
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Sparkles size={24} /> Recommendations</h1>
        <p className="text-sm text-vault-muted">Recommendations only appear after a physical release provider returns a confirmed or likely 4K UHD Blu-ray candidate.</p>
      </div>
      <div className="surface grid gap-3 p-4 md:grid-cols-[1fr_auto]">
        <input className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for physical 4K recommendations by title, director, actor, or genre cluster" />
        <button className="btn btn-primary" disabled={!query.trim() || busy} onClick={() => void search()}>Find physical 4K releases</button>
      </div>
      {recommendations.length === 0 ? (
        <div className="surface p-6 text-vault-muted">No validated physical 4K recommendations yet. Try a title search after configuring providers in Settings.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((recommendation) => (
            <article className="surface overflow-hidden" key={recommendation.id}>
              <div className="grid grid-cols-[110px_1fr]">
                <div className="aspect-[2/3] bg-vault-panel2">
                  {recommendation.posterUrl ? <img src={recommendation.posterUrl} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="space-y-2 p-4">
                  <h2 className="font-semibold">{recommendation.title} {recommendation.year ? `(${recommendation.year})` : ""}</h2>
                  <p className="text-sm text-vault-muted">{recommendation.reason}</p>
                  <p className="text-sm text-vault-muted">{recommendation.knownReleaseInfo || "Release-level provider candidate"}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge bg-vault-cyan/15 text-vault-cyan">{recommendation.validationStatus}</span>
                    <span className="badge bg-vault-panel2 text-vault-muted">{recommendation.confidence}%</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn" onClick={() => void addWishlist(recommendation.candidate)}><Heart size={15} /> Wishlist</button>
                    <a className="btn" href={buildBluRaySearchUrl(recommendation.title, recommendation.year)} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Blu-ray.com</a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
