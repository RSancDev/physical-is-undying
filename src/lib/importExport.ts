import Papa from "papaparse";
import {
  collectionExportSchema,
  collectionItemSchema,
  SCHEMA_VERSION,
  type CollectionExport,
  type CollectionItem
} from "../types";

const csvFields = [
  "title",
  "year",
  "upc",
  "asin",
  "editionName",
  "labelOrDistributor",
  "owned",
  "wishlist",
  "watchedStatus",
  "personalRating",
  "movieRating",
  "videoTransferRating",
  "audioMixRating",
  "purchasePrice",
  "retailer",
  "shelfLocation",
  "validationStatus",
  "bluRayDotComUrl"
] as const;

export function collectionToJson(items: CollectionItem[]): string {
  return JSON.stringify(
    {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      appName: "4K Vault",
      items
    } satisfies CollectionExport,
    null,
    2
  );
}

export function parseCollectionJson(json: string): CollectionExport {
  return collectionExportSchema.parse(JSON.parse(json));
}

export function collectionToCsv(items: CollectionItem[]): string {
  return Papa.unparse(
    items.map((item) =>
      Object.fromEntries(csvFields.map((field) => [field, Array.isArray(item[field]) ? item[field].join("|") : item[field] ?? ""]))
    ),
    { columns: [...csvFields] }
  );
}

export function parseCollectionCsv(csv: string): Partial<CollectionItem>[] {
  const result = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  if (result.errors.length > 0) {
    throw new Error(result.errors.map((error) => error.message).join("; "));
  }
  return result.data.map((row) => ({
    title: row.title,
    year: row.year ? Number(row.year) : undefined,
    upc: row.upc || undefined,
    asin: row.asin || undefined,
    editionName: row.editionName || undefined,
    labelOrDistributor: row.labelOrDistributor || undefined,
    owned: row.owned !== "false",
    wishlist: row.wishlist === "true",
    watchedStatus: row.watchedStatus === "watched" || row.watchedStatus === "rewatch" ? row.watchedStatus : "unwatched",
    personalRating: Number(row.personalRating || 0),
    movieRating: Number(row.movieRating || 0),
    videoTransferRating: Number(row.videoTransferRating || 0),
    audioMixRating: Number(row.audioMixRating || 0),
    purchasePrice: row.purchasePrice ? Number(row.purchasePrice) : undefined,
    retailer: row.retailer || undefined,
    shelfLocation: row.shelfLocation || undefined,
    bluRayDotComUrl: row.bluRayDotComUrl || undefined
  }));
}

export function assertCollectionItem(item: unknown): CollectionItem {
  return collectionItemSchema.parse(item);
}
