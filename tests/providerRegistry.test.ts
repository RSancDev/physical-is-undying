import { beforeEach, describe, expect, it, vi } from "vitest";
import { completeProviderSetup } from "../src/lib/settings";
import { physicalProviders } from "../src/providers/registry";

describe("physical provider registry", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear()
    });
  });

  it("does not create network-backed providers in manual/offline mode", () => {
    completeProviderSetup("manual");

    expect(physicalProviders()).toEqual([]);
  });

  it("creates provider clients when browser keys or proxy mode is selected", () => {
    completeProviderSetup("browserKeys", { tmdbApiKey: "tmdb" });

    expect(physicalProviders().map((provider) => provider.name)).toContain("Disq Product API");
  });
});
