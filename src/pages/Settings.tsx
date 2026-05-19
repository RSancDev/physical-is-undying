import { Download, RotateCcw, Upload } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { bulkImport, clearCollection } from "../db";
import { collectionToCsv, collectionToJson, parseCollectionCsv, parseCollectionJson } from "../lib/importExport";
import { defaultProviderSettings, getProviderSettings, providerSetupChoices, saveProviderSettings } from "../lib/settings";
import { manualItem } from "../lib/releaseFactory";
import { useCollection } from "../hooks/useCollection";
import type { ProviderMode, ProviderSettings } from "../types";

export function Settings() {
  const { items, refresh } = useCollection();
  const [settings, setSettings] = useState<ProviderSettings>(getProviderSettings());
  const [message, setMessage] = useState("");

  function update<K extends keyof ProviderSettings>(key: K, value: ProviderSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function saveSettings() {
    saveProviderSettings({
      ...settings,
      setupComplete: settings.providerMode !== "unset"
    });
    setSettings(getProviderSettings());
    setMessage("Provider settings saved locally.");
  }

  function download(name: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (file.name.endsWith(".json")) {
      await bulkImport(parseCollectionJson(text).items);
      setMessage("Imported JSON collection.");
    } else {
      const drafts = parseCollectionCsv(text);
      await bulkImport(drafts.filter((draft) => draft.title).map((draft) => manualItem({ ...draft, title: draft.title!, format: "4K UHD Blu-ray" }, draft.wishlist)));
      setMessage("Imported CSV as manual releases.");
    }
    await refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-vault-muted">Provider keys stay in this browser only. Use a proxy for secrets that must not be exposed in frontend requests.</p>
      </div>
      <section className="surface p-4">
        <h2 className="text-xl font-semibold">API provider mode</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {providerSetupChoices.map((choice) => (
            <button
              key={choice.mode}
              className={`rounded-lg border p-3 text-left ${settings.providerMode === choice.mode ? "border-vault-cyan bg-vault-cyan/10" : "border-vault-line bg-vault-panel2"}`}
              type="button"
              onClick={() => update("providerMode", choice.mode)}
            >
              <span className="block font-semibold">{choice.title}</span>
              <span className="mt-1 block text-xs text-vault-muted">{choice.summary}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="surface grid gap-3 p-4 md:grid-cols-2">
        <Field label="Disq GraphQL endpoint" value={settings.disqEndpoint} onChange={(value) => update("disqEndpoint", value)} />
        <Field label="Disq API key" type="password" value={settings.disqApiKey ?? ""} onChange={(value) => update("disqApiKey", value)} />
        <Field label="UPCMDB endpoint template" value={settings.upcmdbEndpoint ?? ""} onChange={(value) => update("upcmdbEndpoint", value)} />
        <Field label="UPCMDB API key" type="password" value={settings.upcmdbApiKey ?? ""} onChange={(value) => update("upcmdbApiKey", value)} />
        <Field label="UPCitemdb endpoint" value={settings.upcItemDbEndpoint} onChange={(value) => update("upcItemDbEndpoint", value)} />
        <Field label="TMDb API key" type="password" value={settings.tmdbApiKey ?? ""} onChange={(value) => update("tmdbApiKey", value)} />
        <Field label="TMDb proxy URL" value={settings.tmdbProxyUrl ?? ""} onChange={(value) => update("tmdbProxyUrl", value)} />
        <Field label="Provider proxy URL" value={settings.providerProxyUrl ?? ""} onChange={(value) => update("providerProxyUrl", value)} />
        <div className="md:col-span-2 flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={saveSettings}>Save provider settings</button>
          <button className="btn" onClick={() => setSettings(defaultProviderSettings)}>Reset provider form</button>
          <button className="btn" onClick={() => update("providerMode", "unset" as ProviderMode)}>Show setup on next reload</button>
        </div>
      </section>
      <section className="surface p-4">
        <h2 className="text-xl font-semibold">Data import/export</h2>
        <p className="mt-1 text-sm text-vault-muted">Exported JSON uses schema version 1. CSV is intended for manual import templates and spreadsheet cleanup.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn" onClick={() => download("4k-vault-export.json", collectionToJson(items), "application/json")}><Download size={16} /> Export JSON</button>
          <button className="btn" onClick={() => download("4k-vault-export.csv", collectionToCsv(items), "text/csv")}><Download size={16} /> Export CSV</button>
          <label className="btn cursor-pointer"><Upload size={16} /> Import JSON/CSV<input type="file" className="hidden" accept=".json,.csv" onChange={(event) => void importFile(event)} /></label>
          <button className="btn" onClick={() => { if (confirm("Clear all local IndexedDB collection data?")) void clearCollection().then(refresh); }}><RotateCcw size={16} /> Reset app data</button>
        </div>
      </section>
      <section className="surface p-4 text-sm text-vault-muted">
        <h2 className="text-xl font-semibold text-vault-text">Schema and source policy</h2>
        <p className="mt-2">Schema version: 1. TMDb enriches metadata only; it is never physical release proof. Blu-ray.com links are manual reference links only and are not scraped.</p>
      </section>
      {message && <div className="rounded-md border border-vault-cyan bg-vault-cyan/10 p-3 text-vault-cyan">{message}</div>}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label>
      <span className="mb-1 block text-sm text-vault-muted">{label}</span>
      <input autoComplete="off" className="field" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
