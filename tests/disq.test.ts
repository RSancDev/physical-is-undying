import { describe, expect, it } from "vitest";
import { createDisqProvider } from "../src/providers/disq";
import type { ProviderSettings } from "../src/types";

const baseSettings: ProviderSettings = {
  setupComplete: true,
  providerMode: "browserKeys",
  disqEndpoint: "https://product.disqapis.com/graphql",
  disqApiKey: "",
  upcItemDbEndpoint: "https://api.upcitemdb.com/prod/trial"
};

describe("Disq provider", () => {
  it("uses the current product GraphQL endpoint by default", () => {
    expect(baseSettings.disqEndpoint).toBe("https://product.disqapis.com/graphql");
  });

  it("requires a Disq key for direct browser access", async () => {
    const provider = createDisqProvider(baseSettings);

    await expect(provider.lookupByBarcode("03701432003894")).rejects.toThrow(/requires an API key/i);
  });
});
