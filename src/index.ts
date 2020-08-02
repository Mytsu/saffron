import yargs from 'yargs';
import App from './app';
import path from 'path'

const options = yargs
    .usage(`Usage:  ${process.argv[1]} -u <url>`)
    .option("u", {
        alias: "url",
        describe:
            "Full Novel URL, e.g. https://wuxiaworld.co/The-Legendary-Mechanic/",
        type: "string",
        demandOption: true,
    })
    .option("d", {
        alias: "directory",
        describe: "Directory where to save the novel file",
        type: "string",
    }).argv;

App(options.u, options.d ? options.d : path.resolve(__dirname));

// TODO: setup yargs again

// App('https://www.wuxiaworld.co/Strongest-Abandoned-Son/');
