import type { ProviderSettings } from "../types";

const settingsKey = "4k-vault:provider-settings";
const prefsKey = "4k-vault:preferences";

export type Preferences = {
  includeUncertainMatches: boolean;
  viewMode: "grid" | "table";
  theme: "dark";
  lastBackupAt?: string;
};

export const defaultProviderSettings: ProviderSettings = {
  disqEndpoint: "https://api.disqapis.com/graphql",
  upcItemDbEndpoint: "https://api.upcitemdb.com/prod/trial",
  tmdbProxyUrl: "",
  providerProxyUrl: ""
};

export const defaultPreferences: Preferences = {
  includeUncertainMatches: false,
  viewMode: "grid",
  theme: "dark"
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? ({ ...fallback, ...JSON.parse(value) } as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getProviderSettings(): ProviderSettings {
  return readJson(settingsKey, defaultProviderSettings);
}

export function saveProviderSettings(settings: ProviderSettings): void {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
}

export function getPreferences(): Preferences {
  return readJson(prefsKey, defaultPreferences);
}

export function savePreferences(preferences: Preferences): void {
  localStorage.setItem(prefsKey, JSON.stringify(preferences));
}
