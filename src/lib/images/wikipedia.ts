/**
 * Wikipedia/Wikidata API client for fetching person images
 * Used as fallback when TMDB doesn't have an image
 */

const WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php";

/** Wikipedia page image response */
interface WikipediaImageResponse {
  query?: {
    pages?: Record<string, {
      pageid: number;
      title: string;
      original?: {
        source: string;
        width: number;
        height: number;
      };
      thumbnail?: {
        source: string;
        width: number;
        height: number;
      };
    }>;
  };
}

/**
 * Get image URL from Wikipedia for a person
 */
export async function getWikipediaImage(name: string): Promise<string | null> {
  try {
    const url = new URL(WIKIPEDIA_API_URL);
    url.searchParams.set("action", "query");
    url.searchParams.set("titles", name);
    url.searchParams.set("prop", "pageimages");
    url.searchParams.set("format", "json");
    url.searchParams.set("pithumbsize", "400");
    url.searchParams.set("pilicense", "any");
    url.searchParams.set("origin", "*");

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error("Wikipedia API failed:", response.status);
      return null;
    }

    const data: WikipediaImageResponse = await response.json();

    if (!data.query?.pages) return null;

    // Get the first page result
    const pages = Object.values(data.query.pages);
    if (pages.length === 0) return null;

    const page = pages[0];

    // Prefer original, fallback to thumbnail
    if (page.original?.source) {
      return page.original.source;
    }
    if (page.thumbnail?.source) {
      return page.thumbnail.source;
    }

    return null;
  } catch (error) {
    console.error("Wikipedia image fetch error:", error);
    return null;
  }
}

/**
 * Get image URL from Wikidata SPARQL endpoint
 * More reliable for some celebrities
 */
export async function getWikidataImage(wikidataId: string): Promise<string | null> {
  try {
    const sparqlQuery = `
      SELECT ?image WHERE {
        wd:${wikidataId} wdt:P18 ?image .
      }
      LIMIT 1
    `;

    const url = new URL("https://query.wikidata.org/sparql");
    url.searchParams.set("query", sparqlQuery);
    url.searchParams.set("format", "json");

    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/sparql-results+json",
        "User-Agent": "FMK-Game/1.0",
      },
    });

    if (!response.ok) {
      console.error("Wikidata SPARQL failed:", response.status);
      return null;
    }

    const data = await response.json();

    if (data.results?.bindings?.length > 0) {
      return data.results.bindings[0].image?.value || null;
    }

    return null;
  } catch (error) {
    console.error("Wikidata image fetch error:", error);
    return null;
  }
}
