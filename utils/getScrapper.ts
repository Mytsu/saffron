import { encodeUrl } from '../packages.ts';
import { DomainsEnum } from '../types/DomainsEnum.ts';
import { Scrapper } from '../types/Scrapper.ts';
import ReadLightNovel from '../scrappers/ReadLightNovel.ts';

export default function (
  url: string,
  options?: { ant?: boolean; debug?: boolean },
): Scrapper {
  const encodedUrl = encodeUrl(url);
  switch (new URL(encodedUrl).hostname.replace('www.', '')) {
    case DomainsEnum.ReadLightNovel:
      return new ReadLightNovel(encodedUrl, options);

    case DomainsEnum.BoxNovel:
    case DomainsEnum.WuxiaWorldCo:
    default:
      throw new Error('Failed to parse domain');
  }
}
