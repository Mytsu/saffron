import { Domains } from "../types/Domains.ts";

export function parseDomain(url: string): Domains {
  switch (new URL(url).hostname.replace('www.', '')) {
    case Domains.ReadLightNovel:
      return Domains.ReadLightNovel;
    
    case Domains.BoxNovel:
      return Domains.BoxNovel;

    case Domains.WuxiaWorldCo:
      return Domains.WuxiaWorldCo;

    default:
      throw new Error('Failed to parse domain');
  }
}
