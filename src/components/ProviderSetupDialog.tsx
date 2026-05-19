import { KeyRound, ShieldCheck, WifiOff } from "lucide-react";
import { useMemo, useState } from "react";
import {
  completeProviderSetup,
  getProviderSettings,
  providerSetupChoices
} from "../lib/settings";
import type { ProviderMode, ProviderSettings } from "../types";

const choiceIcons = {
  proxy: ShieldCheck,
  browserKeys: KeyRound,
  manual: WifiOff
};

type SetupMode = Exclude<ProviderMode, "unset">;

export function ProviderSetupDialog({ onComplete }: { onComplete: (settings: ProviderSettings) => void }) {
  const current = useMemo(() => getProviderSettings(), []);
  const [mode, setMode] = useState<SetupMode>("proxy");
  const [draft, setDraft] = useState<Partial<ProviderSettings>>(current);
  const [error, setError] = useState("");

  function update<K extends keyof ProviderSettings>(key: K, value: ProviderSettings[K]) {
    setDraft((next) => ({ ...next, [key]: value }));
    setError("");
  }

  function finish() {
    if (mode === "proxy" && !draft.providerProxyUrl?.trim() && !draft.tmdbProxyUrl?.trim()) {
      setError("Enter at least one proxy endpoint, or choose another mode.");
      return;
    }

    onComplete(completeProviderSetup(mode, draft));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/72 px-4 py-6 backdrop-blur">
      <section className="surface w-full max-w-4xl p-5">
        <div className="flex flex-col gap-2 border-b border-vault-line pb-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-vault-cyan">Provider setup</p>
          <h1 className="text-2xl font-bold">Choose how 4K Vault should use API providers</h1>
          <p className="max-w-3xl text-sm text-vault-muted">
            No API keys are stored in this public GitHub repo. Browser keys stay on this device; protected keys belong behind a proxy.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {providerSetupChoices.map((choice) => {
            const Icon = choiceIcons[choice.mode];
            const active = mode === choice.mode;
            return (
              <button
                key={choice.mode}
                className={`rounded-lg border p-4 text-left transition ${
                  active ? "border-vault-cyan bg-vault-cyan/10" : "border-vault-line bg-vault-panel2 hover:border-vault-cyan"
                }`}
                onClick={() => {
                  setMode(choice.mode);
                  setError("");
                }}
                type="button"
              >
                <Icon className={active ? "text-vault-cyan" : "text-vault-muted"} size={22} aria-hidden="true" />
                <span className="mt-3 block font-semibold">{choice.title}</span>
                <span className="mt-2 block text-sm text-vault-muted">{choice.summary}</span>
                {choice.warning && <span className="mt-3 block text-xs text-vault-amber">{choice.warning}</span>}
              </button>
            );
          })}
        </div>

        {mode === "proxy" && (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Field
              label="Physical provider proxy URL"
              placeholder="https://your-worker.example.com/providers"
              value={draft.providerProxyUrl ?? ""}
              onChange={(value) => update("providerProxyUrl", value)}
            />
            <Field
              label="TMDb proxy URL"
              placeholder="https://your-worker.example.com/tmdb"
              value={draft.tmdbProxyUrl ?? ""}
              onChange={(value) => update("tmdbProxyUrl", value)}
            />
          </div>
        )}

        {mode === "browserKeys" && (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Field label="Disq GraphQL endpoint" value={draft.disqEndpoint ?? ""} onChange={(value) => update("disqEndpoint", value)} />
            <Field label="TMDb API key, optional" type="password" value={draft.tmdbApiKey ?? ""} onChange={(value) => update("tmdbApiKey", value)} />
            <Field label="Disq API key, optional" type="password" value={draft.disqApiKey ?? ""} onChange={(value) => update("disqApiKey", value)} />
            <Field label="UPCMDB API key" type="password" value={draft.upcmdbApiKey ?? ""} onChange={(value) => update("upcmdbApiKey", value)} />
            <Field label="Barcode Lookup API key" type="password" value={draft.barcodeLookupApiKey ?? ""} onChange={(value) => update("barcodeLookupApiKey", value)} />
          </div>
        )}

        {mode === "manual" && (
          <div className="mt-5 rounded-md border border-vault-line bg-vault-panel2 p-4 text-sm text-vault-muted">
            Provider lookups and TMDb enrichment will be disabled until you change modes in Settings. Manual release entry, Blu-ray.com search links, IndexedDB storage, and import/export remain available.
          </div>
        )}

        {error && <div className="mt-4 rounded-md border border-red-400 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button className="btn" type="button" onClick={() => onComplete(completeProviderSetup("manual"))}>
            Continue offline
          </button>
          <button className="btn btn-primary" type="button" onClick={finish}>
            Save setup
          </button>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "url"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "password" | "url";
}) {
  return (
    <label>
      <span className="mb-1 block text-sm text-vault-muted">{label}</span>
      <input
        autoComplete="off"
        className="field"
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
