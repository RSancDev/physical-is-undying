import { z } from "zod";

export const SCHEMA_VERSION = 1;

export const watchedStatusSchema = z.enum(["unwatched", "watched", "rewatch"]);
export const packagingSchema = z.enum([
  "keepcase",
  "steelbook",
  "slipcover",
  "digibook",
  "box set",
  "collector edition",
  "other"
]);
export const conditionSchema = z.enum(["sealed", "like new", "used", "damaged"]);
export const validationStatusSchema = z.enum(["confirmed", "likely", "manual", "unverified", "rejected"]);
export const hdrFormatSchema = z.enum(["HDR10", "HDR10+", "Dolby Vision", "HLG"]);
export const audioFormatSchema = z.enum(["Dolby Atmos", "DTS:X", "Dolby TrueHD", "DTS-HD MA", "LPCM", "other"]);
export const formatSchema = z.literal("4K UHD Blu-ray");

export type WatchedStatus = z.infer<typeof watchedStatusSchema>;
export type Packaging = z.infer<typeof packagingSchema>;
export type Condition = z.infer<typeof conditionSchema>;
export type ValidationStatus = z.infer<typeof validationStatusSchema>;
export type HdrFormat = z.infer<typeof hdrFormatSchema>;
export type AudioFormat = z.infer<typeof audioFormatSchema>;

export const watchEntrySchema = z.object({
  watchedAt: z.string(),
  notes: z.string().optional(),
  rating: z.number().min(0).max(5).optional()
});

export type WatchEntry = z.infer<typeof watchEntrySchema>;

export const providerSnapshotSchema = z.object({
  provider: z.string(),
  providerId: z.string().optional(),
  fetchedAt: z.string(),
  raw: z.unknown().optional()
});

export const collectionItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  sortTitle: z.string(),
  originalTitle: z.string().optional(),
  year: z.number().optional(),
  director: z.array(z.string()).optional(),
  writers: z.array(z.string()).optional(),
  cast: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
  runtime: z.number().optional(),
  synopsis: z.string().optional(),
  posterUrl: z.string().optional(),
  backdropUrl: z.string().optional(),
  tmdbId: z.string().optional(),
  imdbId: z.string().optional(),
  upc: z.string().optional(),
  ean: z.string().optional(),
  gtin: z.string().optional(),
  asin: z.string().optional(),
  editionName: z.string().optional(),
  releaseTitle: z.string().optional(),
  labelOrDistributor: z.string().optional(),
  studio: z.string().optional(),
  boutiqueLabel: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  releaseDate: z.string().optional(),
  format: formatSchema,
  videoResolution: z.string().optional(),
  hdrFormats: z.array(hdrFormatSchema).default([]),
  audioFormats: z.array(audioFormatSchema).default([]),
  aspectRatio: z.string().optional(),
  discCount: z.number().optional(),
  includesStandardBluRay: z.boolean().optional(),
  includesDigitalCode: z.boolean().optional(),
  packaging: packagingSchema.optional(),
  limitedEdition: z.boolean().optional(),
  numberedEdition: z.string().optional(),
  outOfPrint: z.boolean().optional(),
  owned: z.boolean(),
  wishlist: z.boolean(),
  watchedStatus: watchedStatusSchema,
  watchHistory: z.array(watchEntrySchema).default([]),
  personalRating: z.number().min(0).max(5),
  movieRating: z.number().min(0).max(5),
  videoTransferRating: z.number().min(0).max(5),
  audioMixRating: z.number().min(0).max(5),
  extrasRating: z.number().min(0).max(5),
  packagingRating: z.number().min(0).max(5),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  shelfLocation: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional(),
  retailer: z.string().optional(),
  condition: conditionSchema.optional(),
  loanedTo: z.string().optional(),
  dateLoaned: z.string().optional(),
  bluRayDotComUrl: z.string().optional(),
  bluRayDotComReviewUrl: z.string().optional(),
  bluRayDotComVideoScore: z.number().optional(),
  bluRayDotComAudioScore: z.number().optional(),
  bluRayDotComExtrasScore: z.number().optional(),
  dateAdded: z.string(),
  dateUpdated: z.string(),
  validationStatus: validationStatusSchema,
  validationConfidence: z.number().min(0).max(100),
  validationReasons: z.array(z.string()).default([]),
  validationWarnings: z.array(z.string()).default([]),
  providerSnapshots: z.array(providerSnapshotSchema).optional(),
  userEditedFields: z.array(z.string()).optional(),
  source: z.enum(["provider", "manual", "import"]).optional(),
  targetPrice: z.number().optional(),
  preferredEdition: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  retailerLinks: z.array(z.string()).optional(),
  upgradeKind: z.enum(["upgrade", "duplicate", "alternate edition", "replacement copy"]).optional(),
  referenceDisc: z.boolean().optional()
});

export type CollectionItem = z.infer<typeof collectionItemSchema>;

export const collectionExportSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  exportedAt: z.string(),
  appName: z.literal("4K Vault"),
  items: z.array(collectionItemSchema)
});

export type CollectionExport = z.infer<typeof collectionExportSchema>;

export type PhysicalReleaseCandidate = {
  provider: string;
  providerId?: string;
  title: string;
  year?: number;
  format?: string;
  mediaType?: "physical" | "digital" | "unknown";
  upc?: string;
  ean?: string;
  gtin?: string;
  asin?: string;
  editionName?: string;
  releaseTitle?: string;
  labelOrDistributor?: string;
  studio?: string;
  country?: string;
  region?: string;
  releaseDate?: string;
  packaging?: Packaging;
  hdrFormats?: HdrFormat[];
  audioFormats?: AudioFormat[];
  videoResolution?: string;
  discCount?: number;
  posterUrl?: string;
  tmdbId?: string;
  imdbId?: string;
  raw?: unknown;
};

export type ValidationResult = {
  isPhysical4K: boolean;
  confidence: number;
  reasons: string[];
  warnings: string[];
  provider: string;
  status: ValidationStatus;
};

export type MovieMetadataCandidate = {
  id: string;
  title: string;
  year?: number;
  posterUrl?: string;
  synopsis?: string;
};

export type MovieMetadata = MovieMetadataCandidate & {
  originalTitle?: string;
  backdropUrl?: string;
  genres: string[];
  runtime?: number;
  director: string[];
  writers: string[];
  cast: string[];
  imdbId?: string;
};

export type ProviderMode = "unset" | "manual" | "browserKeys" | "proxy";

export type ProviderSettings = {
  setupComplete?: boolean;
  providerMode?: ProviderMode;
  disqEndpoint: string;
  disqApiKey?: string;
  upcmdbEndpoint?: string;
  upcmdbApiKey?: string;
  upcItemDbEndpoint: string;
  goUpcEndpoint?: string;
  goUpcApiKey?: string;
  barcodeLookupEndpoint?: string;
  barcodeLookupApiKey?: string;
  upcDatabaseEndpoint?: string;
  upcDatabaseApiKey?: string;
  tmdbApiKey?: string;
  tmdbProxyUrl?: string;
  providerProxyUrl?: string;
};

export type PhysicalReleaseProvider = {
  name: string;
  searchByTitle(query: string): Promise<PhysicalReleaseCandidate[]>;
  lookupByBarcode(code: string): Promise<PhysicalReleaseCandidate[]>;
  lookupByAsin(asin: string): Promise<PhysicalReleaseCandidate[]>;
  validateRelease(candidate: PhysicalReleaseCandidate): ValidationResult;
};

export type MovieMetadataProvider = {
  name: string;
  searchMovie(query: string): Promise<MovieMetadataCandidate[]>;
  getMovieDetails(id: string): Promise<MovieMetadata>;
  getRecommendations(id: string): Promise<MovieMetadataCandidate[]>;
};

export type ReferenceProvider = {
  name: string;
  buildSearchUrl(title: string, year?: number): string;
};

export type ReleaseDraft = Partial<CollectionItem> & Pick<CollectionItem, "title" | "format">;

export type TitleSearchResult = {
  kind: "provider" | "metadata" | "manual-query";
  title: string;
  year?: number;
  candidate?: PhysicalReleaseCandidate;
  metadata?: MovieMetadataCandidate;
  validation: ValidationResult;
  requiresManualConfirmation: boolean;
  referenceUrls: {
    bluRayDotCom: string;
    fourKFilmDb: string;
  };
};
