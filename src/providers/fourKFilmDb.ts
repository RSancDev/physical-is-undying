import type { ReferenceProvider } from "../types";

export function build4KFilmDbSearchUrl(title: string, year?: number): string {
  const query = encodeURIComponent(`${title} ${year ?? ""}`.replace(/\s+/g, " ").trim());
  return `https://4kfilmdb.com/uhd-reference/?q=${query}`;
}

export const fourKFilmDbProvider: ReferenceProvider = {
  name: "4KFilmDb",
  buildSearchUrl: build4KFilmDbSearchUrl
};
