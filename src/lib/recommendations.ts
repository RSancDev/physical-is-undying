import type { CollectionItem, MovieMetadataCandidate, PhysicalReleaseCandidate } from "../types";
import { validatePhysical4KRelease } from "./validation";

export type Recommendation = {
  id: string;
  title: string;
  year?: number;
  posterUrl?: string;
  reason: string;
  knownReleaseInfo: string;
  confidence: number;
  validationStatus: string;
  candidate: PhysicalReleaseCandidate;
};

export function buildLocalTasteProfile(items: CollectionItem[]) {
  const liked = items.filter((item) => item.watchedStatus !== "unwatched" && item.personalRating >= 4);
  const favoriteGenres = new Set(liked.flatMap((item) => item.genres ?? []));
  const favoriteDirectors = new Set(liked.flatMap((item) => item.director ?? []));
  const favoriteActors = new Set(liked.flatMap((item) => item.cast ?? []).slice(0, 20));
  return { liked, favoriteGenres, favoriteDirectors, favoriteActors };
}

export function candidateRecommendations(
  items: CollectionItem[],
  metadataCandidates: MovieMetadataCandidate[],
  releaseCandidates: PhysicalReleaseCandidate[]
): Recommendation[] {
  const ownedKeys = new Set(items.filter((item) => item.owned).map((item) => `${item.title.toLowerCase()}-${item.year ?? ""}`));
  return releaseCandidates
    .map((candidate) => ({ candidate, validation: validatePhysical4KRelease(candidate) }))
    .filter(({ candidate, validation }) => validation.isPhysical4K && !ownedKeys.has(`${candidate.title.toLowerCase()}-${candidate.year ?? ""}`))
    .map(({ candidate, validation }) => {
      const metadata = metadataCandidates.find((entry) => entry.title.toLowerCase() === candidate.title.toLowerCase());
      return {
        id: `${candidate.provider}-${candidate.providerId ?? candidate.upc ?? candidate.asin ?? candidate.title}`,
        title: candidate.title,
        year: candidate.year,
        posterUrl: metadata?.posterUrl ?? candidate.posterUrl,
        reason: "Validated physical 4K candidate related to your collection",
        knownReleaseInfo: [candidate.releaseTitle, candidate.labelOrDistributor, candidate.editionName].filter(Boolean).join(" · "),
        confidence: validation.confidence,
        validationStatus: validation.status,
        candidate
      };
    });
}
