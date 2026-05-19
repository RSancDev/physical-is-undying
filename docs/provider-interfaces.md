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

Physical release providers are authoritative for whether a product is a physical 4K Ultra HD Blu-ray release. TMDb enriches metadata only and cannot validate physical media existence.

Blu-ray.com and 4KFilmDb are reference providers only: search URLs are generated, links open in a new tab, and user-pasted URLs/specs can be stored. Pages are not scraped.

The 4KFilmDb UHD Reference page visibly uses a published CSV plus client-side filtering and describes a hand-verified, multi-reviewer scoring workflow. Because the data and scoring are not licensed to this project, 4K Vault only creates search links with `build4KFilmDbSearchUrl(title, year)` and never treats 4KFilmDb or TMDb as automatic physical-release proof.
