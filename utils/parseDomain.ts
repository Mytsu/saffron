import { DomainsEnum } from "../types/DomainsEnum.ts";

export default function (url: string): DomainsEnum {
  switch (new URL(url).hostname.replace("www.", "")) {
    case DomainsEnum.ReadLightNovel:
      return DomainsEnum.ReadLightNovel;

    case DomainsEnum.BoxNovel:
      return DomainsEnum.BoxNovel;

    case DomainsEnum.WuxiaWorldCo:
      return DomainsEnum.WuxiaWorldCo;

    default:
      throw new Error("Failed to parse domain");
  }
}
