import { config } from "../packages.ts";

export async function fetchFromAnt(url: string): Promise<string> {
  const response = await fetch(
    `https://api.scrapingant.com/v1/general?url=${url}`,
    {
      method: "GET",
      headers: {
        "x-api-key": config().scrapingAntAPI,
      },
    },
  );
  return (await response.json()).content;
}
