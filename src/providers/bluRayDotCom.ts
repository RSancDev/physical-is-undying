import type { ReferenceProvider } from "../types";

export function buildBluRaySearchUrl(title: string, year?: number): string {
  const query = encodeURIComponent(`${title} ${year ?? ""} 4K UHD`.replace(/\s+/g, " ").trim());
  return `https://www.blu-ray.com/search/?quicksearch=1&quicksearch_country=US&quicksearch_keyword=${query}`;
}

export const bluRayDotComProvider: ReferenceProvider = {
  name: "Blu-ray.com",
  buildSearchUrl: buildBluRaySearchUrl
};
