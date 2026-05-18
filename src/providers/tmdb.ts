import type { MovieMetadataCandidate, MovieMetadataProvider, ProviderSettings } from "../types";

const imageBase = "https://image.tmdb.org/t/p/w500";
const backdropBase = "https://image.tmdb.org/t/p/w1280";

function yearFromDate(date?: string): number | undefined {
  return date ? Number(date.slice(0, 4)) || undefined : undefined;
}

function tmdbUrl(path: string, settings: ProviderSettings, params: Record<string, string> = {}): string {
  const base = settings.tmdbProxyUrl || "https://api.themoviedb.org/3";
  const url = new URL(`${base}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  if (!settings.tmdbProxyUrl && settings.tmdbApiKey) url.searchParams.set("api_key", settings.tmdbApiKey);
  return url.toString();
}

async function tmdbFetch(path: string, settings: ProviderSettings, params: Record<string, string> = {}) {
  if (!settings.tmdbApiKey && !settings.tmdbProxyUrl) {
    throw new Error("Configure a TMDb API key or proxy endpoint in Settings.");
  }
  const response = await fetch(tmdbUrl(path, settings, params), {
    headers: settings.tmdbProxyUrl || settings.tmdbApiKey?.startsWith("eyJ") ? { Authorization: `Bearer ${settings.tmdbApiKey ?? ""}` } : {}
  });
  if (!response.ok) throw new Error(`TMDb request failed: ${response.status}`);
  return response.json();
}

function candidate(movie: any): MovieMetadataCandidate {
  return {
    id: String(movie.id),
    title: movie.title,
    year: yearFromDate(movie.release_date),
    posterUrl: movie.poster_path ? `${imageBase}${movie.poster_path}` : undefined,
    synopsis: movie.overview
  };
}

export function createTmdbProvider(settings: ProviderSettings): MovieMetadataProvider {
  return {
    name: "TMDb",
    async searchMovie(query) {
      const json = await tmdbFetch("/search/movie", settings, { query });
      return (json.results ?? []).map(candidate);
    },
    async getMovieDetails(id) {
      const json = await tmdbFetch(`/movie/${id}`, settings, { append_to_response: "credits,external_ids" });
      const crew = json.credits?.crew ?? [];
      return {
        id: String(json.id),
        title: json.title,
        originalTitle: json.original_title,
        year: yearFromDate(json.release_date),
        posterUrl: json.poster_path ? `${imageBase}${json.poster_path}` : undefined,
        backdropUrl: json.backdrop_path ? `${backdropBase}${json.backdrop_path}` : undefined,
        synopsis: json.overview,
        genres: (json.genres ?? []).map((genre: any) => genre.name),
        runtime: json.runtime,
        director: crew.filter((person: any) => person.job === "Director").map((person: any) => person.name),
        writers: crew.filter((person: any) => ["Writer", "Screenplay", "Story"].includes(person.job)).map((person: any) => person.name),
        cast: (json.credits?.cast ?? []).slice(0, 12).map((person: any) => person.name),
        imdbId: json.external_ids?.imdb_id
      };
    },
    async getRecommendations(id) {
      const json = await tmdbFetch(`/movie/${id}/recommendations`, settings);
      return (json.results ?? []).map(candidate);
    }
  };
}
