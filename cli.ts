import { parse } from './packages.ts';
import getScrapper from './utils/getScrapper.ts';
import saveAsMarkdown from './utils/saveAsMarkdown.ts';

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

-o / --out <filename> Output filename (written in markdown)
--ant                 Enables the use of ScrapingAnt API
--debug               Enables logging
`;

const enableAnt = args.ant ? true : false;
const initArg = args.init ? Number(args.init) : undefined;
const endArg = args.end ? Number(args.end) : undefined;
const filename = args.o || args.out;
const command = args._[InputEnum.COMMAND];
const debug = args.debug ? true : false;

function cmdNotFound(): void {
  console.error('Saffron requires an url to fetch!');
  console.info(help);
  Deno.exit(1);
}

async function getCommand() {
  const novel = await getScrapper(url.toString(), {
    ant: enableAnt,
    debug,
  }).getNovel({
    init: initArg,
    end: endArg,
  });
  saveAsMarkdown(novel, filename);
}

async function getLength() {
  const novel = await getScrapper(url.toString(), {
    ant: enableAnt,
    debug,
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
