import { Camera, CheckCircle2, ExternalLink, Search, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { findDuplicateMatches } from "../lib/duplicates";
import { itemFromCandidate, manualItem } from "../lib/releaseFactory";
import { validatePhysical4KRelease } from "../lib/validation";
import { buildBluRaySearchUrl } from "../providers/bluRayDotCom";
import { searchPhysicalByBarcode, searchPhysicalByTitle } from "../providers/registry";
import { useCollection } from "../hooks/useCollection";
import type { CollectionItem, PhysicalReleaseCandidate } from "../types";

export function AddRelease() {
  const navigate = useNavigate();
  const { items, save } = useCollection();
  const [mode, setMode] = useState<"barcode" | "title" | "manual">("barcode");
  const [query, setQuery] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualYear, setManualYear] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [results, setResults] = useState<PhysicalReleaseCandidate[]>([]);
  const [includeUncertain, setIncludeUncertain] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const candidates = useMemo(
    () =>
      results
        .map((candidate) => ({ candidate, validation: validatePhysical4KRelease(candidate) }))
        .filter(({ validation }) => includeUncertain || validation.status === "confirmed" || validation.status === "likely"),
    [includeUncertain, results]
  );

  async function runSearch() {
    setBusy(true);
    setError("");
    setResults([]);
    try {
      const next = mode === "barcode" ? await searchPhysicalByBarcode(query) : await searchPhysicalByTitle(query);
      setResults(next);
      if (next.length === 0) {
        setError(
          mode === "title"
            ? "No physical release candidates found by title. Disq currently supports UPC/EAN/GTIN/ASIN lookup, not title search; try a barcode/ASIN, Blu-ray.com search, or manual entry."
            : "No provider candidates found for that UPC/EAN/GTIN/ASIN. Confirm the code, try Blu-ray.com search, or add the release manually."
        );
      }
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : String(searchError));
    } finally {
      setBusy(false);
    }
  }

  async function addCandidate(candidate: PhysicalReleaseCandidate, manualOverride = false) {
    const item = itemFromCandidate(candidate, { manualOverride });
    await save(item);
    navigate(`/release/${item.id}`);
  }

  async function addManual(wishlist = false) {
    const item = manualItem(
      {
        title: manualTitle.trim(),
        year: manualYear ? Number(manualYear) : undefined,
        format: "4K UHD Blu-ray",
        bluRayDotComUrl: manualUrl || undefined,
        validationReasons: ["Manual confirmation"]
      },
      wishlist
    );
    await save(item);
    navigate(`/release/${item.id}`);
  }

  const manualDuplicates = manualTitle
    ? findDuplicateMatches({ title: manualTitle, year: manualYear ? Number(manualYear) : undefined, format: "4K UHD Blu-ray", bluRayDotComUrl: manualUrl }, items)
    : [];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Add Release</h1>
          <p className="text-sm text-vault-muted">Search UPC, EAN, GTIN, or ASIN first. TMDb enrichment is metadata only and never validates physical 4K status.</p>
        </div>
        <div className="surface p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {(["barcode", "title", "manual"] as const).map((nextMode) => (
              <button key={nextMode} className={`btn ${mode === nextMode ? "border-vault-cyan text-vault-cyan" : ""}`} onClick={() => setMode(nextMode)}>
                {nextMode}
              </button>
            ))}
          </div>
          {mode === "manual" ? (
            <div className="space-y-3">
              <input className="field" value={manualTitle} onChange={(event) => setManualTitle(event.target.value)} placeholder="Title" />
              <input className="field" value={manualYear} onChange={(event) => setManualYear(event.target.value)} placeholder="Year" inputMode="numeric" />
              <input className="field" value={manualUrl} onChange={(event) => setManualUrl(event.target.value)} placeholder="Blu-ray.com release URL" />
              {manualDuplicates.length > 0 && <DuplicateWarning matches={manualDuplicates} />}
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-primary" disabled={!manualTitle.trim()} onClick={() => void addManual(false)}>
                  Add owned manual
                </button>
                <button className="btn" disabled={!manualTitle.trim()} onClick={() => void addManual(true)}>
                  Add to wishlist
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  className="field"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={mode === "barcode" ? "UPC, EAN, GTIN, or ASIN" : "Movie title"}
                />
                <button className="btn btn-primary" disabled={!query.trim() || busy} onClick={() => void runSearch()}>
                  <Search size={16} />
                  Search
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn" disabled title="Barcode Detection API scanner can be wired where supported">
                  <Camera size={16} />
                  Camera scanner
                </button>
                {query && (
                  <a className="btn" href={buildBluRaySearchUrl(query)} target="_blank" rel="noreferrer">
                    <ExternalLink size={16} />
                    Search Blu-ray.com
                  </a>
                )}
                <label className="flex items-center gap-2 text-sm text-vault-muted">
                  <input type="checkbox" checked={includeUncertain} onChange={(event) => setIncludeUncertain(event.target.checked)} />
                  Include uncertain matches
                </label>
              </div>
              {error && <div className="rounded-md border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-vault-gold">{error}</div>}
            </div>
          )}
        </div>
        <div className="space-y-3">
          {candidates.map(({ candidate, validation }) => {
            const duplicates = findDuplicateMatches(itemFromCandidate(candidate, { manualOverride: validation.status === "unverified" }), items);
            return (
              <article key={`${candidate.provider}-${candidate.providerId ?? candidate.upc ?? candidate.title}`} className="surface p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{candidate.releaseTitle ?? candidate.title}</h2>
                    <p className="text-sm text-vault-muted">{[candidate.provider, candidate.year, candidate.upc ?? candidate.ean ?? candidate.gtin ?? candidate.asin].filter(Boolean).join(" · ")}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="badge bg-vault-cyan/15 text-vault-cyan">{validation.status}</span>
                      <span className="badge bg-vault-panel2 text-vault-muted">{validation.confidence}% confidence</span>
                    </div>
                    <ul className="mt-3 list-inside list-disc text-sm text-vault-muted">
                      {validation.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                      {validation.warnings.map((warning) => <li key={warning} className="text-vault-gold">{warning}</li>)}
                    </ul>
                  </div>
                  <div className="flex min-w-44 flex-col gap-2">
                    <button className="btn btn-primary" disabled={!validation.isPhysical4K} onClick={() => void addCandidate(candidate)}>
                      <CheckCircle2 size={16} />
                      Add release
                    </button>
                    <button className="btn" onClick={() => void addCandidate(candidate, true)}>
                      Manual override
                    </button>
                  </div>
                </div>
                {duplicates.length > 0 && <DuplicateWarning matches={duplicates} />}
              </article>
            );
          })}
        </div>
      </section>
      <aside className="surface h-fit p-4">
        <h2 className="font-semibold">Validation rules</h2>
        <p className="mt-2 text-sm text-vault-muted">Confirmed and likely results can be added. Unverified results require manual confirmation. Rejected digital, DVD-only, or standard Blu-ray-only records need an explicit override.</p>
        <p className="mt-3 text-sm text-vault-muted">Blu-ray.com is a reference companion only. This app opens manual searches and stores pasted URLs/specs, but it does not scrape Blu-ray.com.</p>
      </aside>
    </div>
  );
}

function DuplicateWarning({ matches }: { matches: { item: CollectionItem; reasons: string[] }[] }) {
  return (
    <div className="mt-3 rounded-md border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-vault-gold">
      <div className="mb-1 flex items-center gap-2 font-semibold"><ShieldAlert size={16} /> Possible duplicate</div>
      {matches.map((match) => (
        <div key={match.item.id}>{match.item.title}: {match.reasons.join(", ")}</div>
      ))}
    </div>
  );
}
