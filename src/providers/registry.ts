import { createDisqProvider } from "./disq";
import { createConfigurableBarcodeProvider, createUpcItemDbProvider } from "./genericBarcode";
import { createTmdbProvider } from "./tmdb";
import { getProviderSettings } from "../lib/settings";
import type { MovieMetadataProvider, PhysicalReleaseCandidate, PhysicalReleaseProvider } from "../types";

export function physicalProviders(): PhysicalReleaseProvider[] {
  const settings = getProviderSettings();
  if (settings.providerMode === "manual" || settings.providerMode === "unset") return [];
  const providerKey = (key?: string) => (settings.providerMode === "browserKeys" ? key : undefined);
  return [
    createDisqProvider(settings),
    createConfigurableBarcodeProvider("UPCMDB", settings.upcmdbEndpoint, providerKey(settings.upcmdbApiKey)),
    createUpcItemDbProvider(settings),
    createConfigurableBarcodeProvider("Go-UPC", settings.goUpcEndpoint, providerKey(settings.goUpcApiKey)),
    createConfigurableBarcodeProvider("Barcode Lookup", settings.barcodeLookupEndpoint, providerKey(settings.barcodeLookupApiKey)),
    createConfigurableBarcodeProvider("UPCDatabase.org", settings.upcDatabaseEndpoint, providerKey(settings.upcDatabaseApiKey))
  ];
}

export function metadataProvider(): MovieMetadataProvider {
  return createTmdbProvider(getProviderSettings());
}

function providerErrorMessage(providerName: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return `${providerName}: ${message}`;
}

function looksLikeAsin(value: string): boolean {
  return /^[A-Z0-9]{10}$/i.test(value.trim()) && /[A-Z]/i.test(value);
}

export async function searchPhysicalByBarcode(code: string) {
  const providers = physicalProviders();
  const results: PhysicalReleaseCandidate[] = [];
  const errors: string[] = [];
  for (const provider of providers) {
    try {
      const matches = looksLikeAsin(code) ? await provider.lookupByAsin(code.trim()) : await provider.lookupByBarcode(code);
      results.push(...matches);
      if (matches.length > 0 && /Disq|UPCMDB/i.test(provider.name)) break;
    } catch (error) {
      errors.push(providerErrorMessage(provider.name, error));
    }
  }
  if (results.length === 0 && errors.length > 0) {
    throw new Error(`Provider lookup failed. ${errors.join(" ")}`);
  }
  return results;
}

export async function searchPhysicalByTitle(query: string) {
  const results: PhysicalReleaseCandidate[] = [];
  const errors: string[] = [];
  for (const provider of physicalProviders()) {
    try {
      results.push(...(await provider.searchByTitle(query)));
    } catch (error) {
      errors.push(providerErrorMessage(provider.name, error));
    }
  }
  if (results.length === 0 && errors.length > 0) {
    throw new Error(`Provider lookup failed. ${errors.join(" ")}`);
  }
  return results;
}
