import { describe, expect, it } from "vitest";
import { findDuplicateMatches } from "../src/lib/duplicates";
import type { CollectionItem } from "../src/types";

const existing = {
  id: "1",
  title: "Dune",
  sortTitle: "Dune",
  year: 2021,
  format: "4K UHD Blu-ray",
  owned: true,
  wishlist: false,
  watchedStatus: "unwatched",
  watchHistory: [],
  personalRating: 0,
  movieRating: 0,
  videoTransferRating: 0,
  audioMixRating: 0,
  extrasRating: 0,
  packagingRating: 0,
  tags: [],
  hdrFormats: ["Dolby Vision"],
  audioFormats: ["Dolby Atmos"],
  dateAdded: "2026-01-01T00:00:00.000Z",
  dateUpdated: "2026-01-01T00:00:00.000Z",
  validationStatus: "confirmed",
  validationConfidence: 95,
  validationReasons: [],
  validationWarnings: [],
  upc: "883929701421",
  asin: "B09GYH6857",
  editionName: "Steelbook",
  labelOrDistributor: "Warner Bros.",
  bluRayDotComUrl: "https://www.blu-ray.com/movies/Dune-4K-Blu-ray/293812/"
} satisfies CollectionItem;

describe("findDuplicateMatches", () => {
  it("matches duplicate releases by identifiers and edition clues", () => {
    const matches = findDuplicateMatches(
      {
        title: "Dune",
        year: 2021,
        format: "4K UHD Blu-ray",
        upc: "883929701421",
        editionName: "Steelbook"
      },
      [existing]
    );

    expect(matches).toHaveLength(1);
    expect(matches[0]?.reasons).toEqual(expect.arrayContaining(["UPC/EAN/GTIN match"]));
  });
});
