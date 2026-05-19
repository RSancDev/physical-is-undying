import { CheckCircle2, ExternalLink, Heart, Search, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { findDuplicateMatches } from "../lib/duplicates";
import { itemFromCandidate } from "../lib/releaseFactory";
import { createManualItemFromTitleSearchResult, search4KTitle } from "../lib/titleSearch";
import type { CollectionItem, TitleSearchResult } from "../types";

type TitleSearchPanelProps = {
  items: CollectionItem[];
  onSaveItem: (item: CollectionItem) => Promise<void>;
  emptyCopy?: string;
  embedded?: boolean;
  placeholder?: string;
};

export function TitleSearchPanel({
  items,
  onSaveItem,
  emptyCopy = "Search for physical 4K Blu-ray releases by title.",
  embedded = false,
  placeholder = "Search title, director, actor, label, or disc"
}: TitleSearchPanelProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TitleSearchResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  async function runSearch() {
    setBusy(true);
    setError("");
    setHasSearched(true);
    try {
      setResults(await search4KTitle(query));
    } catch (searchError) {
      setResults([]);
      setError(searchError instanceof Error ? searchError.message : String(searchError));
    } finally {
      setBusy(false);
    }
  }

  async function saveProviderResult(result: TitleSearchResult, wishlist = false) {
    if (!result.candidate) return;
    const item = itemFromCandidate(result.candidate, { owned: !wishlist, wishlist });
    await onSaveItem(item);
    navigate(`/release/${item.id}`);
  }

  async function saveManualResult(result: TitleSearchResult, wishlist = false) {
    const item = createManualItemFromTitleSearchResult(result, wishlist);
    await onSaveItem(item);
    navigate(`/release/${item.id}`);
  }

  return (
    <div className="space-y-4">
      <div className={embedded ? "space-y-3" : "surface p-4"}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && query.trim() && !busy) void runSearch();
            }}
            placeholder={placeholder}
          />
          <button className="btn btn-primary" disabled={!query.trim() || busy} onClick={() => void runSearch()}>
            <Search size={16} />
            Search
          </button>
        </div>
        <p className={embedded ? "text-sm text-vault-muted" : "mt-3 text-sm text-vault-muted"}>
          Provider matches are validated as release candidates. TMDb and reference-only matches require explicit manual confirmation.
        </p>
        {error && <div className="mt-3 rounded-md border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-vault-gold">{error}</div>}
      </div>

      {!hasSearched && <div className="surface p-6 text-sm text-vault-muted">{emptyCopy}</div>}
      {hasSearched && !busy && results.length === 0 && <div className="surface p-6 text-sm text-vault-muted">No title results found.</div>}

      <div className="space-y-3">
        {results.map((result) => (
          <TitleSearchCard
            key={`${result.kind}-${result.candidate?.providerId ?? result.metadata?.id ?? result.title}-${result.year ?? ""}`}
            result={result}
            items={items}
            onSaveProvider={saveProviderResult}
            onSaveManual={saveManualResult}
          />
        ))}
      </div>
    </div>
  );
}

function TitleSearchCard({
  result,
  items,
  onSaveProvider,
  onSaveManual
}: {
  result: TitleSearchResult;
  items: CollectionItem[];
  onSaveProvider: (result: TitleSearchResult, wishlist?: boolean) => Promise<void>;
  onSaveManual: (result: TitleSearchResult, wishlist?: boolean) => Promise<void>;
}) {
  const duplicateProbe = result.candidate
    ? itemFromCandidate(result.candidate, { manualOverride: result.requiresManualConfirmation })
    : createManualItemFromTitleSearchResult(result);
  const duplicates = findDuplicateMatches(duplicateProbe, items);
  const isProviderAddable = result.kind === "provider" && result.candidate && result.validation.isPhysical4K;

  return (
    <article className="surface overflow-hidden p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="badge bg-vault-panel2 text-vault-muted">{result.kind === "provider" ? "Release provider" : result.kind === "metadata" ? "Metadata only" : "Manual search"}</span>
            <span className={`badge ${result.validation.isPhysical4K ? "bg-vault-cyan/15 text-vault-cyan" : "bg-amber-400/10 text-vault-gold"}`}>
              {result.validation.status}
            </span>
            <span className="badge bg-vault-panel2 text-vault-muted">{result.validation.confidence}% confidence</span>
          </div>
          <h2 className="text-lg font-semibold">
            {result.title} {result.year ? `(${result.year})` : ""}
          </h2>
          {result.metadata?.synopsis && <p className="mt-2 max-w-3xl text-sm text-vault-muted">{result.metadata.synopsis}</p>}
          {result.candidate?.releaseTitle && <p className="mt-2 text-sm text-vault-muted">{result.candidate.releaseTitle}</p>}
          <ul className="mt-3 list-inside list-disc text-sm text-vault-muted">
            {result.validation.reasons.map((reason) => <li key={reason}>{reason}</li>)}
            {result.validation.warnings.map((warning) => <li key={warning} className="text-vault-gold">{warning}</li>)}
          </ul>
        </div>
        <div className="flex min-w-48 flex-col gap-2">
          {isProviderAddable ? (
            <>
              <button className="btn btn-primary" onClick={() => void onSaveProvider(result, false)}>
                <CheckCircle2 size={16} />
                Add release
              </button>
              <button className="btn" onClick={() => void onSaveProvider(result, true)}>
                <Heart size={16} />
                Add to wishlist
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={() => void onSaveManual(result, false)}>
                <CheckCircle2 size={16} />
                Add owned manual
              </button>
              <button className="btn" onClick={() => void onSaveManual(result, true)}>
                <Heart size={16} />
                Add to wishlist
              </button>
            </>
          )}
          <a className="btn" href={result.referenceUrls.bluRayDotCom} target="_blank" rel="noreferrer">
            <ExternalLink size={16} />
            Search Blu-ray.com
          </a>
          <a className="btn" href={result.referenceUrls.fourKFilmDb} target="_blank" rel="noreferrer">
            <ExternalLink size={16} />
            Search 4KFilmDb
          </a>
        </div>
      </div>
      {duplicates.length > 0 && (
        <div className="mt-3 rounded-md border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-vault-gold">
          <div className="mb-1 flex items-center gap-2 font-semibold"><ShieldAlert size={16} /> Possible duplicate</div>
          {duplicates.map((match) => (
            <div key={match.item.id}>{match.item.title}: {match.reasons.join(", ")}</div>
          ))}
        </div>
      )}
    </article>
  );
}
