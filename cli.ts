import { parse } from "https://deno.land/std@0.100.0/flags/mod.ts";
import { encodeUrl } from "https://deno.land/x/encodeurl@1.0.0/mod.ts";
import { DomainsEnum } from "./types/DomainsEnum.ts";
import { Scrapper } from "./types/Scrapper.ts";
import { Novel } from "./types/Novel.ts";
import { parseDomain } from "./utils/parseDomain.ts";
import { ReadLightNovel } from "./scrappers/ReadLightNovel.ts";

enum InputEnum {
  COMMAND = 0,
  INPUT = 1,
}

const args = parse(Deno.args);
const help = `Usage: saffron get <url> [options]
Options:

-d / --dir\tDirectory where the novel is saved at, saves in current directory if not specified
--ant\tUse ScrapingAnt API`;

if (args.help) {
  console.log(help);
  Deno.exit(0);
}

const antArg = args.ant ? true : false;
const initArg = Number(args.init);
const endArg = Number(args.end);
const command = args._[InputEnum.COMMAND];

switch (command) {
  case "get":
    await getNovel(args._[InputEnum.INPUT].toString(), {
      init: initArg,
      end: endArg,
    });
    break;

  default:
    cmdNotFound();
    break;
}

function cmdNotFound(): void {
  console.error("Saffron requires an url to fetch!");
  console.info(help);
  Deno.exit(1);
}

async function getNovel(
  url: string,
  options?: { init: number; end: number },
): Promise<Novel> {
  let scrapper: Scrapper;
  switch (parseDomain(url)) {
    case DomainsEnum.ReadLightNovel:
      scrapper = new ReadLightNovel(encodeUrl(url), antArg);
      break;

    case DomainsEnum.BoxNovel:
    case DomainsEnum.WuxiaWorldCo:
    default:
      throw new Error("Domain support not implemented");
  }
  return scrapper.getNovel(options);
}
