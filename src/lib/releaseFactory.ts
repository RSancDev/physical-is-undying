import { createId } from "./id";
import { manualValidation, validatePhysical4KRelease } from "./validation";
import type { CollectionItem, PhysicalReleaseCandidate, ReleaseDraft, ValidationResult } from "../types";

function sortTitle(title: string): string {
  return title.replace(/^(the|a|an)\s+/i, "").trim();
}

export function itemFromCandidate(
  candidate: PhysicalReleaseCandidate,
  options: { owned?: boolean; wishlist?: boolean; manualOverride?: boolean } = {}
): CollectionItem {
  const validation: ValidationResult = options.manualOverride ? manualValidation(candidate.provider) : validatePhysical4KRelease(candidate);
  const now = new Date().toISOString();
  return {
    id: createId("release"),
    title: candidate.title,
    sortTitle: sortTitle(candidate.title),
    year: candidate.year,
    format: "4K UHD Blu-ray",
    owned: options.owned ?? true,
    wishlist: options.wishlist ?? false,
    watchedStatus: "unwatched",
    watchHistory: [],
    personalRating: 0,
    movieRating: 0,
    videoTransferRating: 0,
    audioMixRating: 0,
    extrasRating: 0,
    packagingRating: 0,
    notes: "",
    tags: [],
    hdrFormats: candidate.hdrFormats ?? [],
    audioFormats: candidate.audioFormats ?? [],
    dateAdded: now,
    dateUpdated: now,
    validationStatus: validation.status,
    validationConfidence: validation.confidence,
    validationReasons: validation.reasons,
    validationWarnings: validation.warnings,
    source: options.manualOverride ? "manual" : "provider",
    upc: candidate.upc,
    ean: candidate.ean,
    gtin: candidate.gtin,
    asin: candidate.asin,
    editionName: candidate.editionName,
    releaseTitle: candidate.releaseTitle,
    labelOrDistributor: candidate.labelOrDistributor,
    studio: candidate.studio,
    country: candidate.country,
    region: candidate.region,
    releaseDate: candidate.releaseDate,
    packaging: candidate.packaging,
    videoResolution: candidate.videoResolution,
    discCount: candidate.discCount,
    posterUrl: candidate.posterUrl,
    tmdbId: candidate.tmdbId,
    imdbId: candidate.imdbId,
    providerSnapshots: [
      {
        provider: candidate.provider,
        providerId: candidate.providerId,
        fetchedAt: now,
        raw: candidate.raw
      }
    ],
    userEditedFields: []
  };
}

export function manualItem(draft: ReleaseDraft, wishlist = false): CollectionItem {
  const now = new Date().toISOString();
  const validation = manualValidation("Manual entry");
  const { title, format: _format, ...rest } = draft;
  return {
    ...rest,
    id: createId("release"),
    title,
    sortTitle: draft.sortTitle ?? sortTitle(title),
    year: draft.year,
    format: "4K UHD Blu-ray",
    owned: !wishlist,
    wishlist,
    watchedStatus: draft.watchedStatus ?? "unwatched",
    watchHistory: draft.watchHistory ?? [],
    personalRating: draft.personalRating ?? 0,
    movieRating: draft.movieRating ?? 0,
    videoTransferRating: draft.videoTransferRating ?? 0,
    audioMixRating: draft.audioMixRating ?? 0,
    extrasRating: draft.extrasRating ?? 0,
    packagingRating: draft.packagingRating ?? 0,
    notes: draft.notes ?? "",
    tags: draft.tags ?? [],
    hdrFormats: draft.hdrFormats ?? [],
    audioFormats: draft.audioFormats ?? [],
    dateAdded: now,
    dateUpdated: now,
    validationStatus: validation.status,
    validationConfidence: validation.confidence,
    validationReasons: validation.reasons,
    validationWarnings: validation.warnings,
    source: "manual"
  };
}
