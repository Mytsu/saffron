import { encodeUrl, parse } from "./packages.ts";
import { DomainsEnum } from "./types/DomainsEnum.ts";
import { Scrapper } from "./types/Scrapper.ts";
import { parseDomain } from "./utils/parseDomain.ts";
import saveAsMarkdown from "./utils/saveAsMarkdown.ts";
import { ReadLightNovel } from "./scrappers/ReadLightNovel.ts";

enum InputEnum {
  COMMAND = 0,
  INPUT = 1,
}

const args = parse(Deno.args);
const help = `Usage: saffron <cmd> <url> [options]

Commands:
get <url>             Fetch and format novel to markdown
length <url>          Fetch metadata and prints the chapter count

Options:

-o / --out <filename> Output filename (written in markdown)
--ant                 Enables the use of ScrapingAnt API
--force-scrap         Ignores the novel in the database and scraps it from the url
--debug               Enables logging
`;

const enableAnt = args.ant ? true : false;
const initArg = Number(args.init);
const endArg = Number(args.end);
const filename = args.o || args.out;
const command = args._[InputEnum.COMMAND];
const debug = args.debug ? true : false;

function cmdNotFound(): void {
  console.error("Saffron requires an url to fetch!");
  console.info(help);
  Deno.exit(1);
}

function getScrapper(
  url: string,
): Scrapper {
  let scrapper: Scrapper;
  switch (parseDomain(url)) {
    case DomainsEnum.ReadLightNovel:
      scrapper = new ReadLightNovel(encodeUrl(url), enableAnt, debug);
      break;

    case DomainsEnum.BoxNovel:
    case DomainsEnum.WuxiaWorldCo:
    default:
      throw new Error("Domain support not implemented");
  }
  return scrapper;
}

async function getCommand() {
  const novel = await getScrapper(url.toString())
    .getNovel(
      {
        init: initArg,
        end: endArg,
      },
    );
  await saveAsMarkdown(novel, filename);
}

async function getLength() {
  const novel = await getScrapper(url.toString()).getNovel({ init: 0, end: 0 });
  for await (const url of novel.metadata.chapterUrls) console.log(url);
  console.info(
    `Novel: ${novel.metadata.title}\nChapters: ${novel.metadata.chapterUrls.length}`,
  );
}

if (args.help) {
  console.log(help);
  Deno.exit(0);
}

if (!args._[InputEnum.INPUT]) {
  console.error("url not provided");
  Deno.exit(1);
}

const url = args._[InputEnum.INPUT];

switch (command) {
  case "get":
    await getCommand();
    break;
  case "length":
    await getLength();
    break;

  default:
    cmdNotFound();
    break;
}
