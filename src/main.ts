import yargs from 'yargs/yargs';
import { dumpToFile, getNovel } from './app';
import { Novel } from './types';
import path from 'path';

const options = yargs()
    .usage(`Usage:  ${path.basename(process.argv[1], '.js')} -u <url> -d <directory>`)
    .option('u', {
        alias: 'url',
        describe:
            'Full Novel URL, e.g. https://wuxiaworld.co/The-Legendary-Mechanic/',
        type: 'string',
        demandOption: true,
    })
    .option('d', {
        alias: 'directory',
        describe: 'Directory where to save the novel file',
        type: 'string'
    }).parse(process.argv);

getNovel(options.u).then((novel: Novel) => {
    const dir = `${options.d ? path.resolve(options.d) : path.resolve(__dirname)}/${novel.metadata.title}.md`;
    dumpToFile(novel, dir);
});
