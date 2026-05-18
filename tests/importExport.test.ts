import { describe, expect, it } from "vitest";
import { collectionToCsv, collectionToJson, parseCollectionJson } from "../src/lib/importExport";
import type { CollectionItem } from "../src/types";

const item = {
  id: "item-1",
  title: "Alien",
  sortTitle: "Alien",
  year: 1979,
  format: "4K UHD Blu-ray",
  owned: true,
  wishlist: false,
  watchedStatus: "watched",
  watchHistory: [{ watchedAt: "2026-01-02T00:00:00.000Z", notes: "Great transfer" }],
  personalRating: 5,
  movieRating: 5,
  videoTransferRating: 5,
  audioMixRating: 4,
  extrasRating: 4,
  packagingRating: 4,
  tags: ["best HDR10"],
  hdrFormats: ["HDR10"],
  audioFormats: ["DTS-HD MA"],
  dateAdded: "2026-01-01T00:00:00.000Z",
  dateUpdated: "2026-01-01T00:00:00.000Z",
  validationStatus: "manual",
  validationConfidence: 85,
  validationReasons: ["Manual confirmation"],
  validationWarnings: []
} satisfies CollectionItem;

describe("import/export", () => {
  it("round-trips schema-versioned JSON exports", () => {
    const json = collectionToJson([item]);
    const parsed = parseCollectionJson(json);

    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.items[0]?.title).toBe("Alien");
  });

  it("exports CSV with core collector fields", () => {
    const csv = collectionToCsv([item]);

    expect(csv).toContain("title,year,upc,asin,editionName");
    expect(csv).toContain("Alien");
  });
});
