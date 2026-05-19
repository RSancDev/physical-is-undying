import type { ProviderMode, ProviderSettings } from "../types";

const settingsKey = "4k-vault:provider-settings";
const prefsKey = "4k-vault:preferences";

export type Preferences = {
  includeUncertainMatches: boolean;
  viewMode: "grid" | "table";
  theme: "dark";
  lastBackupAt?: string;
};

export type ProviderSetupChoice = {
  mode: Exclude<ProviderMode, "unset">;
  title: string;
  summary: string;
  warning?: string;
};

export type ProviderSetupState = {
  complete: boolean;
  mode: ProviderMode;
  requiresSetup: boolean;
};

export const providerSetupChoices: ProviderSetupChoice[] = [
  {
    mode: "proxy",
    title: "Use a protected proxy",
    summary: "GitHub Pages calls your Cloudflare Worker, Netlify Function, or Vercel Function. Provider keys stay in serverless environment secrets.",
    warning: "Best for Disq, paid barcode APIs, shared keys, and anything that must not be visible in browser requests."
  },
  {
    mode: "browserKeys",
    title: "Use my own browser keys",
    summary: "Keys are entered on this device and stored only in this browser. They are never committed to GitHub.",
    warning: "Frontend keys can still be seen by the person using this browser and in that browser's network requests."
  },
  {
    mode: "manual",
    title: "Manual/offline only",
    summary: "No provider network calls are made. You can add manually confirmed 4K releases, use Blu-ray.com search links, and import/export data."
  }
];

export const defaultProviderSettings: ProviderSettings = {
  setupComplete: false,
  providerMode: "unset",
  disqEndpoint: import.meta.env.VITE_DISQ_ENDPOINT || "https://api.disqapis.com/graphql",
  disqApiKey: "",
  upcItemDbEndpoint: "https://api.upcitemdb.com/prod/trial",
  upcmdbEndpoint: "",
  upcmdbApiKey: "",
  goUpcEndpoint: "",
  goUpcApiKey: "",
  barcodeLookupEndpoint: "",
  barcodeLookupApiKey: "",
  upcDatabaseEndpoint: "",
  upcDatabaseApiKey: "",
  tmdbApiKey: "",
  tmdbProxyUrl: import.meta.env.VITE_TMDB_PROXY_URL || "",
  providerProxyUrl: import.meta.env.VITE_PROVIDER_PROXY_URL || ""
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
  const next = normalizeProviderSettings(settings);
  localStorage.setItem(settingsKey, JSON.stringify(next));
}

export function getProviderSetupState(): ProviderSetupState {
  const settings = getProviderSettings();
  const mode = settings.providerMode ?? "unset";
  return {
    complete: Boolean(settings.setupComplete && mode !== "unset"),
    mode,
    requiresSetup: !settings.setupComplete || mode === "unset"
  };
}

export function completeProviderSetup(mode: Exclude<ProviderMode, "unset">, settings: Partial<ProviderSettings> = {}): ProviderSettings {
  const next = normalizeProviderSettings({
    ...getProviderSettings(),
    ...settings,
    providerMode: mode,
    setupComplete: true
  });
  localStorage.setItem(settingsKey, JSON.stringify(next));
  return next;
}

export function normalizeProviderSettings(settings: ProviderSettings): ProviderSettings {
  const mode = settings.providerMode ?? "unset";
  const next: ProviderSettings = {
    ...defaultProviderSettings,
    ...settings,
    providerMode: mode,
    setupComplete: Boolean(settings.setupComplete && mode !== "unset")
  };

  if (mode === "manual") {
    return {
      ...next,
      disqApiKey: "",
      upcmdbApiKey: "",
      goUpcApiKey: "",
      barcodeLookupApiKey: "",
      upcDatabaseApiKey: "",
      tmdbApiKey: "",
      tmdbProxyUrl: "",
      providerProxyUrl: ""
    };
  }

  if (mode === "proxy") {
    return {
      ...next,
      disqApiKey: "",
      upcmdbApiKey: "",
      goUpcApiKey: "",
      barcodeLookupApiKey: "",
      upcDatabaseApiKey: "",
      tmdbApiKey: ""
    };
  }

  return next;
}

export function getPreferences(): Preferences {
  return readJson(prefsKey, defaultPreferences);
}

export function savePreferences(preferences: Preferences): void {
  localStorage.setItem(prefsKey, JSON.stringify(preferences));
}
