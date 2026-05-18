import type { CollectionItem, ReleaseDraft } from "../types";

export type DuplicateMatch = {
  item: CollectionItem;
  reasons: string[];
};

function sameText(a?: string, b?: string): boolean {
  return Boolean(a && b && a.trim().toLowerCase() === b.trim().toLowerCase());
}

function sameTitleYear(candidate: ReleaseDraft, item: CollectionItem): boolean {
  return sameText(candidate.title, item.title) && candidate.year === item.year;
}

export function findDuplicateMatches(candidate: ReleaseDraft, items: CollectionItem[]): DuplicateMatch[] {
  return items
    .map((item) => {
      const reasons: string[] = [];
      if (sameText(candidate.upc ?? candidate.ean ?? candidate.gtin, item.upc ?? item.ean ?? item.gtin)) {
        reasons.push("UPC/EAN/GTIN match");
      }
      if (sameText(candidate.asin, item.asin)) reasons.push("ASIN match");
      if (sameText(candidate.bluRayDotComUrl, item.bluRayDotComUrl)) reasons.push("Blu-ray.com URL match");
      if (sameText(candidate.tmdbId, item.tmdbId) && sameText(candidate.editionName, item.editionName)) {
        reasons.push("TMDb ID plus edition match");
      }
      if (sameTitleYear(candidate, item) && sameText(candidate.editionName, item.editionName)) {
        reasons.push("Title/year/edition match");
      }
      if (
        sameTitleYear(candidate, item) &&
        (sameText(candidate.labelOrDistributor, item.labelOrDistributor) || sameText(candidate.studio, item.studio))
      ) {
        reasons.push("Title/year/label or distributor match");
      }
      return { item, reasons };
    })
    .filter((match) => match.reasons.length > 0);
}
