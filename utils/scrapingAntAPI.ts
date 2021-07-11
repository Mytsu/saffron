import { config } from 'https://deno.land/x/dotenv@v2.0.0/mod.ts';

export async function fetchFromAnt(url: string): Promise<string> {
  const response = await fetch(
    `https://api.scrapingant.com/v1/general?url=${url}`,
    {
      method: 'GET',
      headers: {
        'x-api-key': config().scrapingAntAPI,
      },
    },
  );
  return (await response.json()).content;
}
