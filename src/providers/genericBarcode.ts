import type { PhysicalReleaseCandidate, PhysicalReleaseProvider, ProviderSettings } from "../types";
import { validatePhysical4KRelease } from "../lib/validation";

function mapGenericItem(provider: string, item: any): PhysicalReleaseCandidate {
  const title = item.title ?? item.name ?? item.description ?? item.product_name ?? "Unknown release";
  const category = [item.category, item.categoryPath, item.brand, item.description, item.title].filter(Boolean).join(" ");
  return {
    provider,
    providerId: item.id ?? item.ean ?? item.upc ?? item.gtin,
    title,
    format: category,
    mediaType: /blu|dvd|disc|movie|video/i.test(category) ? "physical" : "unknown",
    upc: item.upc,
    ean: item.ean,
    gtin: item.gtin,
    asin: item.asin,
    releaseTitle: title,
    labelOrDistributor: item.brand ?? item.manufacturer,
    posterUrl: item.images?.[0] ?? item.imageUrl,
    raw: item
  };
}

async function fetchJson(url: string, headers: HeadersInit = {}) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`Barcode provider failed: ${response.status}`);
  return response.json();
}

export function createUpcItemDbProvider(settings: ProviderSettings): PhysicalReleaseProvider {
  async function lookupByBarcode(code: string): Promise<PhysicalReleaseCandidate[]> {
    const json = await fetchJson(`${settings.upcItemDbEndpoint}/lookup?upc=${encodeURIComponent(code)}`);
    return (json.items ?? []).map((item: any) => mapGenericItem("UPCitemdb", item));
  }
  async function searchByTitle(query: string): Promise<PhysicalReleaseCandidate[]> {
    const json = await fetchJson(`${settings.upcItemDbEndpoint}/search?s=${encodeURIComponent(`${query} 4K UHD Blu-ray`)}`);
    return (json.items ?? []).map((item: any) => mapGenericItem("UPCitemdb", item));
  }
  return {
    name: "UPCitemdb",
    searchByTitle,
    lookupByBarcode,
    lookupByAsin: async () => [],
    validateRelease: validatePhysical4KRelease
  };
}

export function createConfigurableBarcodeProvider(
  name: string,
  endpoint: string | undefined,
  apiKey: string | undefined
): PhysicalReleaseProvider {
  async function request(query: string): Promise<PhysicalReleaseCandidate[]> {
    if (!endpoint) return [];
    const url = endpoint.replace("{query}", encodeURIComponent(query)).replace("{barcode}", encodeURIComponent(query));
    const json = await fetchJson(url, apiKey ? { Authorization: `Bearer ${apiKey}` } : {});
    const items = json.items ?? json.products ?? json.results ?? (json.product ? [json.product] : []);
    return items.map((item: any) => mapGenericItem(name, item));
  }
  return {
    name,
    searchByTitle: request,
    lookupByBarcode: request,
    lookupByAsin: request,
    validateRelease: validatePhysical4KRelease
  };
}
