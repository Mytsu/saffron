import { parse } from './packages.ts';
import getScrapper from './utils/getScrapper.ts';
import { saveAsMarkdown, saveAsJson } from './utils/save.ts';

enum InputEnum {
  COMMAND = 0,
  INPUT = 1,
}

const args = parse(Deno.args);
const help = `Usage: ${
  new URL('', import.meta.url).pathname
} <cmd> <url> [options]

Commands:

  get <url>             Fetch and format novel to markdown
  length <url>          Fetch metadata and prints the chapter count

Options:

  -o / --out <dir>      Output name
  --debug               Enables logging
  --silent              Disables progress bar
  --json                Outputs novel as json
  --init <number>       Starting index
  --end <number>        Ending index

  You can use the https://scrapingant.com/ API to fetch novels in protected domains.

  --ant                 Enables the use of ScrapingAnt API
  --antKey <key>        Replace the default ScrapingAnt API Key
 `;

const ant = args.ant ? true : false;
const antKey = args.antKey ? args.antKey : '';
const asJson = args.json ? true : false;
const init = args.init ? Number(args.init) : undefined;
const end = args.end ? Number(args.end) : undefined;
const output = args.o || args.out;
const command = args._[InputEnum.COMMAND];
const debug = args.debug ? true : false;
const silent = args.silent ? true : false;

function cmdNotFound(): void {
  console.error('Saffron requires an url to fetch!');
  console.info(help);
  Deno.exit(1);
}

async function getCommand() {
  const novel = await getScrapper(url.toString(), {
    ant,
    antKey,
    debug,
    silent
  }).getNovel({
    init,
    end,
  });
  if (asJson) saveAsJson(novel, output)
  else saveAsMarkdown(novel, output);
}

async function getLength() {
  const novel = await getScrapper(url.toString(), {
    ant,
    antKey,
    debug
  }).getNovel({ init: 0, end: 0 });
  console.info(
    `Novel: ${novel.metadata.title}\nChapters: ${novel.metadata.chapterUrls.length}`,
  );
}

if (!args._[InputEnum.COMMAND] || args.help) {
  console.info(help);
  Deno.exit(0);
}

if (!args._[InputEnum.INPUT]) {
  console.error('url not provided');
  Deno.exit(1);
}

const url = args._[InputEnum.INPUT];

switch (command) {
  case 'get':
    await getCommand();
    break;
  case 'length':
    await getLength();
    break;

  default:
    cmdNotFound();
    break;
}
