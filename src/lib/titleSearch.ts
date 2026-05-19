import { buildBluRaySearchUrl } from "../providers/bluRayDotCom";
import { build4KFilmDbSearchUrl } from "../providers/fourKFilmDb";
import { metadataProvider, searchPhysicalByTitle } from "../providers/registry";
import { manualItem } from "./releaseFactory";
import { validatePhysical4KRelease } from "./validation";
import type { CollectionItem, MovieMetadataCandidate, PhysicalReleaseCandidate, TitleSearchResult, ValidationResult } from "../types";

function unverifiedValidation(provider: string, warning: string): ValidationResult {
  return {
    isPhysical4K: false,
    confidence: 0,
    reasons: [],
    warnings: [warning],
    provider,
    status: "unverified"
  };
}

function referenceUrls(title: string, year?: number) {
  return {
    bluRayDotCom: buildBluRaySearchUrl(title, year),
    fourKFilmDb: build4KFilmDbSearchUrl(title, year)
  };
}

function providerResult(candidate: PhysicalReleaseCandidate): TitleSearchResult {
  const validation = validatePhysical4KRelease(candidate);
  return {
    kind: "provider",
    title: candidate.title,
    year: candidate.year,
    candidate,
    validation,
    requiresManualConfirmation: !validation.isPhysical4K,
    referenceUrls: referenceUrls(candidate.title, candidate.year)
  };
}

function metadataResult(metadata: MovieMetadataCandidate): TitleSearchResult {
  return {
    kind: "metadata",
    title: metadata.title,
    year: metadata.year,
    metadata,
    validation: unverifiedValidation("TMDb", "TMDb is metadata only and does not prove a physical 4K UHD Blu-ray release exists"),
    requiresManualConfirmation: true,
    referenceUrls: referenceUrls(metadata.title, metadata.year)
  };
}

function manualQueryResult(query: string): TitleSearchResult {
  return {
    kind: "manual-query",
    title: query.trim(),
    validation: unverifiedValidation("Manual search", "No release provider confirmed this title; verify it manually before adding"),
    requiresManualConfirmation: true,
    referenceUrls: referenceUrls(query.trim())
  };
}

function dedupeMetadata(metadata: MovieMetadataCandidate[], providerCandidates: PhysicalReleaseCandidate[]) {
  const providerKeys = new Set(providerCandidates.map((candidate) => `${candidate.title.toLowerCase()}-${candidate.year ?? ""}`));
  return metadata.filter((candidate) => !providerKeys.has(`${candidate.title.toLowerCase()}-${candidate.year ?? ""}`));
}

export async function search4KTitle(query: string): Promise<TitleSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  let releaseCandidates: PhysicalReleaseCandidate[] = [];
  let metadataCandidates: MovieMetadataCandidate[] = [];

  try {
    releaseCandidates = await searchPhysicalByTitle(trimmed);
  } catch {
    releaseCandidates = [];
  }

  try {
    metadataCandidates = await metadataProvider().searchMovie(trimmed);
  } catch {
    metadataCandidates = [];
  }

  const providerResults = releaseCandidates.map(providerResult);
  const metadataResults = dedupeMetadata(metadataCandidates, releaseCandidates).map(metadataResult);
  const results = [...providerResults, ...metadataResults];

  return results.length > 0 ? results : [manualQueryResult(trimmed)];
}

export function createManualItemFromTitleSearchResult(result: TitleSearchResult, wishlist = false): CollectionItem {
  return manualItem(
    {
      title: result.title,
      year: result.year,
      format: "4K UHD Blu-ray",
      posterUrl: result.metadata?.posterUrl ?? result.candidate?.posterUrl,
      synopsis: result.metadata?.synopsis,
      tmdbId: result.metadata?.id ?? result.candidate?.tmdbId,
      bluRayDotComUrl: result.referenceUrls.bluRayDotCom,
      validationReasons: ["Manual confirmation after title/reference search"],
      validationWarnings: result.validation.warnings
    },
    wishlist
  );
}
