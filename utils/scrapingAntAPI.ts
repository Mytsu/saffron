export async function fetchFromAnt(
  url: string,
  options?: { apiKey?: string },
): Promise<string> {
  if (!options?.apiKey) {
    console.error("ScrapingAnt API requires an API key");
    console.error("Please provide an ScrapingAnt API key via the --antKey flag");
    Deno.exit(1);
  }
  const response = await fetch(
    `https://api.scrapingant.com/v1/general?url=${url}`,
    {
      method: 'GET',
      headers: {
        'x-api-key': options?.apiKey,
      },
    },
  );
  return (await response.json()).content;
}
