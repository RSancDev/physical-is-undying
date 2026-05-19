import type { PhysicalReleaseCandidate, PhysicalReleaseProvider, ProviderSettings } from "../types";
import { validatePhysical4KRelease } from "../lib/validation";

const lookupQuery = `
query ProductLookup($query: ProductLookupQuery!) {
  lookup(query: $query) {
    sid
    asin
    gtin
    ean
    name
    image(variation: { h: 600, w: 400 })
    releaseDate
    discs
    mediaCount
    media {
      titles {
        creativeWork {
          name
          originalName
          tmdbId
          imdbId
          releaseYear
          image(variation: { h: 600, w: 400 })
        }
        videoTracks { resolution aspectRatio }
        audioTracks { language }
      }
    }
  }
}`;

function authHeaders(settings: ProviderSettings): HeadersInit {
  return settings.providerMode === "browserKeys" && settings.disqApiKey ? { Authorization: `Bearer ${settings.disqApiKey}` } : {};
}

function mapDisqProduct(product: any): PhysicalReleaseCandidate {
  const title = product?.media?.[0]?.titles?.[0];
  const work = title?.creativeWork;
  const videoResolution = title?.videoTracks?.find((track: any) => track?.resolution)?.resolution;
  return {
    provider: "Disq Product API",
    providerId: product.sid,
    title: work?.name ?? product.name,
    year: work?.releaseYear,
    format: `${product.name ?? ""} ${videoResolution ?? ""}`.match(/4k|uhd|2160/i) ? "4K UHD Blu-ray" : product.name,
    mediaType: "physical",
    gtin: product.gtin,
    ean: product.ean,
    asin: product.asin,
    releaseTitle: product.name,
    releaseDate: product.releaseDate,
    videoResolution,
    discCount: product.discs ?? product.mediaCount,
    posterUrl: work?.image ?? product.image,
    tmdbId: work?.tmdbId,
    imdbId: work?.imdbId,
    raw: product
  };
}

export function createDisqProvider(settings: ProviderSettings): PhysicalReleaseProvider {
  async function lookup(value: string, type?: "gtin" | "asin"): Promise<PhysicalReleaseCandidate[]> {
    if (!value.trim()) return [];
    const endpoint = (settings.providerMode === "proxy" && settings.providerProxyUrl ? settings.providerProxyUrl : settings.disqEndpoint).trim();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...authHeaders(settings)
      },
      body: JSON.stringify({ query: lookupQuery, variables: { query: { type, value: value.trim() } } })
    });
    if (!response.ok) throw new Error(`Disq lookup failed: ${response.status}`);
    const json = await response.json();
    const product = json.data?.lookup;
    return product ? [mapDisqProduct(product)] : [];
  }

  return {
    name: "Disq Product API",
    searchByTitle: async () => [],
    lookupByBarcode: (code) => lookup(code, "gtin"),
    lookupByAsin: (asin) => lookup(asin, "asin"),
    validateRelease: validatePhysical4KRelease
  };
}
