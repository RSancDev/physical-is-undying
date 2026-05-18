# Provider Interfaces

4K Vault separates release validation from movie metadata.

```ts
interface PhysicalReleaseProvider {
  name: string;
  searchByTitle(query: string): Promise<PhysicalReleaseCandidate[]>;
  lookupByBarcode(code: string): Promise<PhysicalReleaseCandidate[]>;
  lookupByAsin(asin: string): Promise<PhysicalReleaseCandidate[]>;
  validateRelease(candidate: PhysicalReleaseCandidate): ValidationResult;
}

interface MovieMetadataProvider {
  name: string;
  searchMovie(query: string): Promise<MovieMetadataCandidate[]>;
  getMovieDetails(id: string): Promise<MovieMetadata>;
  getRecommendations(id: string): Promise<MovieMetadataCandidate[]>;
}

interface ReferenceProvider {
  name: string;
  buildSearchUrl(title: string, year?: number): string;
}
```

Physical release providers are authoritative for whether a product is a physical 4K Ultra HD Blu-ray release. TMDb enriches metadata only and cannot validate physical media existence. Blu-ray.com is a reference provider only: search URLs are generated and user-pasted URLs/specs can be stored, but pages are not scraped.
