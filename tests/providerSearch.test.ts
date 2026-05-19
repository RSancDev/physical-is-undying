import { beforeEach, describe, expect, it, vi } from "vitest";
import { completeProviderSetup } from "../src/lib/settings";
import { searchPhysicalByBarcode, searchPhysicalByTitle } from "../src/providers/registry";

describe("provider search error handling", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear()
    });
  });

  it("does not return provider failures as release candidates", async () => {
    completeProviderSetup("browserKeys");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(searchPhysicalByBarcode("123456789012")).rejects.toThrow(/Provider lookup failed/i);
  });

  it("returns an empty candidate list in manual/offline mode", async () => {
    completeProviderSetup("manual");

    await expect(searchPhysicalByTitle("Wall-E")).resolves.toEqual([]);
  });
});
