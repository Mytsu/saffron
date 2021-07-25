import { config } from '../packages.ts';

export async function fetchFromAnt(
  url: string,
  options?: { apiKey?: string },
): Promise<string> {
  const response = await fetch(
    `https://api.scrapingant.com/v1/general?url=${url}`,
    {
      method: 'GET',
      headers: {
        'x-api-key': options?.apiKey
          ? options?.apiKey
          : config().scrapingAntAPI,
      },
    },
  );
  return (await response.json()).content;
}
