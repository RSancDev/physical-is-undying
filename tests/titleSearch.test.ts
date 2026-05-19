import { beforeEach, describe, expect, it, vi } from "vitest";
import { completeProviderSetup } from "../src/lib/settings";
import { createManualItemFromTitleSearchResult, search4KTitle } from "../src/lib/titleSearch";

describe("4K title search", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear()
    });
  });

  it("falls back to a manual confirmation result when providers and TMDb are unavailable", async () => {
    completeProviderSetup("manual");

    await expect(search4KTitle("The Thing")).resolves.toMatchObject([
      {
        kind: "manual-query",
        title: "The Thing",
        requiresManualConfirmation: true,
        validation: {
          isPhysical4K: false,
          status: "unverified"
        },
        referenceUrls: {
          bluRayDotCom: "https://www.blu-ray.com/search/?quicksearch=1&quicksearch_country=US&quicksearch_keyword=The%20Thing%204K%20UHD",
          fourKFilmDb: "https://4kfilmdb.com/uhd-reference/?q=The%20Thing"
        }
      }
    ]);
  });

  it("returns TMDb title matches as metadata-only manual confirmation results", async () => {
    completeProviderSetup("browserKeys", { tmdbApiKey: "tmdb" });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("upcitemdb.com")) return new Response(JSON.stringify({ items: [] }));
        if (url.includes("api.themoviedb.org/3/search/movie")) {
          return new Response(
            JSON.stringify({
              results: [
                {
                  id: 1091,
                  title: "The Thing",
                  release_date: "1982-06-25",
                  overview: "Antarctic paranoia.",
                  poster_path: "/thing.jpg"
                }
              ]
            })
          );
        }
        return new Response(JSON.stringify({ data: { lookup: null } }));
      })
    );

    const results = await search4KTitle("The Thing");

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      kind: "metadata",
      title: "The Thing",
      year: 1982,
      requiresManualConfirmation: true,
      metadata: {
        id: "1091"
      },
      validation: {
        isPhysical4K: false,
        status: "unverified"
      }
    });
  });

  it("creates manually confirmed 4K UHD Blu-ray items from metadata-only results", async () => {
    completeProviderSetup("manual");
    const [result] = await search4KTitle("The Thing");

    const item = createManualItemFromTitleSearchResult(result, false);

    expect(item).toMatchObject({
      title: "The Thing",
      format: "4K UHD Blu-ray",
      owned: true,
      wishlist: false,
      validationStatus: "manual",
      source: "manual"
    });
  });
});
