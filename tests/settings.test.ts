import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeProviderSetup,
  getProviderSettings,
  getProviderSetupState,
  providerSetupChoices
} from "../src/lib/settings";

describe("provider setup settings", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear()
    });
    localStorage.removeItem("4k-vault:provider-settings");
    localStorage.removeItem("4k-vault:preferences");
  });

  it("requires first-run setup until a provider mode is selected", () => {
    expect(getProviderSetupState()).toEqual({
      complete: false,
      mode: "unset",
      requiresSetup: true
    });
  });

  it("stores manual/offline mode without API keys", () => {
    completeProviderSetup("manual");

    expect(getProviderSetupState()).toEqual({
      complete: true,
      mode: "manual",
      requiresSetup: false
    });
    expect(getProviderSettings()).toMatchObject({
      setupComplete: true,
      providerMode: "manual",
      tmdbApiKey: "",
      disqApiKey: ""
    });
  });

  it("stores direct browser mode without requiring keys or proxy endpoints", () => {
    completeProviderSetup("browserKeys");

    expect(getProviderSettings()).toMatchObject({
      setupComplete: true,
      providerMode: "browserKeys",
      tmdbApiKey: "",
      disqApiKey: ""
    });
  });

  it("stores proxy mode and leaves direct frontend keys blank", () => {
    completeProviderSetup("proxy", {
      providerProxyUrl: "https://vault-proxy.example.com/providers",
      tmdbProxyUrl: "https://vault-proxy.example.com/tmdb",
      tmdbApiKey: "should-not-persist"
    });

    expect(getProviderSettings()).toMatchObject({
      setupComplete: true,
      providerMode: "proxy",
      providerProxyUrl: "https://vault-proxy.example.com/providers",
      tmdbProxyUrl: "https://vault-proxy.example.com/tmdb",
      tmdbApiKey: "",
      disqApiKey: ""
    });
  });

  it("documents the three hybrid setup choices", () => {
    expect(providerSetupChoices.map((choice) => choice.mode)).toEqual(["proxy", "browserKeys", "manual"]);
  });
});
