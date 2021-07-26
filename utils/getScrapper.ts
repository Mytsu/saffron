import { encodeUrl } from '../packages.ts';
import { DomainsEnum } from '../types/DomainsEnum.ts';
import { Scrapper } from '../types/Scrapper.ts';
import { ReadLightNovelDotOrg } from '../scrappers/ReadLightNovel.ts';
import { BoxNovelDotCom } from '../scrappers/BoxNovel.ts';
// import { WuxiaWorldDotCo } from '../scrappers/WuxiaWorld.ts';

export default function (
  url: string,
  options?: { ant?: boolean; antKey?: string; debug?: boolean },
): Scrapper {
  const encodedUrl = encodeUrl(url);
  switch (new URL(encodedUrl).hostname.replace('www.', '')) {
    case DomainsEnum.ReadLightNovel:
      return new ReadLightNovelDotOrg(encodedUrl, options);

    case DomainsEnum.BoxNovel:
      return new BoxNovelDotCom(encodedUrl, options);
      
    case DomainsEnum.WuxiaWorldCo:
      // return new WuxiaWorldDotCo(encodedUrl, options);
        
    default:
      throw new Error('Domain not supported :(');
  }
}
