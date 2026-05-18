import { createDisqProvider } from "./disq";
import { createConfigurableBarcodeProvider, createUpcItemDbProvider } from "./genericBarcode";
import { createTmdbProvider } from "./tmdb";
import { getProviderSettings } from "../lib/settings";
import type { MovieMetadataProvider, PhysicalReleaseProvider } from "../types";

export function physicalProviders(): PhysicalReleaseProvider[] {
  const settings = getProviderSettings();
  return [
    createDisqProvider(settings),
    createConfigurableBarcodeProvider("UPCMDB", settings.upcmdbEndpoint, settings.upcmdbApiKey),
    createUpcItemDbProvider(settings),
    createConfigurableBarcodeProvider("Go-UPC", settings.goUpcEndpoint, settings.goUpcApiKey),
    createConfigurableBarcodeProvider("Barcode Lookup", settings.barcodeLookupEndpoint, settings.barcodeLookupApiKey),
    createConfigurableBarcodeProvider("UPCDatabase.org", settings.upcDatabaseEndpoint, settings.upcDatabaseApiKey)
  ];
}

export function metadataProvider(): MovieMetadataProvider {
  return createTmdbProvider(getProviderSettings());
}

export async function searchPhysicalByBarcode(code: string) {
  const providers = physicalProviders();
  const results = [];
  for (const provider of providers) {
    try {
      const matches = await provider.lookupByBarcode(code);
      results.push(...matches);
      if (matches.length > 0 && /Disq|UPCMDB/i.test(provider.name)) break;
    } catch (error) {
      results.push({
        provider: provider.name,
        title: `Provider error for ${code}`,
        format: "Unknown",
        mediaType: "unknown" as const,
        raw: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }
  return results;
}

export async function searchPhysicalByTitle(query: string) {
  const results = [];
  for (const provider of physicalProviders()) {
    try {
      results.push(...(await provider.searchByTitle(query)));
    } catch {
      continue;
    }
  }
  return results;
}
