import type { CollectionItem } from "../types";

function avg(values: number[]): number {
  const useful = values.filter((value) => value > 0);
  return useful.length ? Number((useful.reduce((sum, value) => sum + value, 0) / useful.length).toFixed(1)) : 0;
}

export function collectionStats(items: CollectionItem[]) {
  const owned = items.filter((item) => item.owned);
  const watched = owned.filter((item) => item.watchedStatus !== "unwatched");
  const wishlist = items.filter((item) => item.wishlist);
  const totalValue = owned.reduce((sum, item) => sum + (item.purchasePrice ?? 0), 0);
  return {
    ownedCount: owned.length,
    watchedCount: watched.length,
    unwatchedCount: owned.length - watched.length,
    wishlistCount: wishlist.length,
    averagePersonalRating: avg(owned.map((item) => item.personalRating)),
    averageMovieRating: avg(owned.map((item) => item.movieRating)),
    averageVideoTransferRating: avg(owned.map((item) => item.videoTransferRating)),
    averageAudioMixRating: avg(owned.map((item) => item.audioMixRating)),
    totalValue
  };
}

export function groupCount(items: CollectionItem[], getValues: (item: CollectionItem) => string[] | string | undefined) {
  const map = new Map<string, number>();
  items.forEach((item) => {
    const values = getValues(item);
    const list = Array.isArray(values) ? values : values ? [values] : ["Unknown"];
    list.forEach((value) => map.set(value, (map.get(value) ?? 0) + 1));
  });
  return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}
