import { describe, expect, it } from "vitest";
import { buildBluRaySearchUrl } from "../src/providers/bluRayDotCom";
import { build4KFilmDbSearchUrl } from "../src/providers/fourKFilmDb";

describe("buildBluRaySearchUrl", () => {
  it("builds a manual Blu-ray.com search URL without scraping", () => {
    expect(buildBluRaySearchUrl("The Thing", 1982)).toBe(
      "https://www.blu-ray.com/search/?quicksearch=1&quicksearch_country=US&quicksearch_keyword=The%20Thing%201982%204K%20UHD"
    );
  });
});

describe("build4KFilmDbSearchUrl", () => {
  it("builds a manual 4KFilmDb reference search URL without scraping", () => {
    expect(build4KFilmDbSearchUrl("The Thing", 1982)).toBe("https://4kfilmdb.com/uhd-reference/?q=The%20Thing%201982");
  });
});
