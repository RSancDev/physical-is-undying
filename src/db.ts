import Dexie, { type Table } from "dexie";
import type { CollectionItem } from "./types";

class VaultDatabase extends Dexie {
  collection!: Table<CollectionItem, string>;

  constructor() {
    super("4k-vault");
    this.version(1).stores({
      collection:
        "id, title, sortTitle, year, upc, ean, gtin, asin, tmdbId, owned, wishlist, watchedStatus, validationStatus, dateAdded, dateUpdated, releaseDate, retailer, shelfLocation"
    });
  }
}

export const db = new VaultDatabase();

export async function getAllItems(): Promise<CollectionItem[]> {
  return db.collection.orderBy("sortTitle").toArray();
}

export async function saveItem(item: CollectionItem): Promise<string> {
  const dateUpdated = new Date().toISOString();
  await db.collection.put({ ...item, dateUpdated });
  return item.id;
}

export async function deleteItem(id: string): Promise<void> {
  await db.collection.delete(id);
}

export async function clearCollection(): Promise<void> {
  await db.collection.clear();
}

export async function bulkImport(items: CollectionItem[]): Promise<void> {
  await db.transaction("rw", db.collection, async () => {
    await db.collection.bulkPut(items);
  });
}
