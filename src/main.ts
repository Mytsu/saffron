import yargs from 'yargs/yargs';
import { dumpToFile, getNovel } from './app';
import { Novel } from './types';
import path from 'path';

// TODO: Handle CLI args without yargs (due to broken webpack imports)

console.log(process.argv);

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
    }).argv;

getNovel(options.u).then((novel: Novel) => {
    dumpToFile(
        novel,
        options.d ? path.resolve(options.d) : path.resolve(__dirname)
    );
});
