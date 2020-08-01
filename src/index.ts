import yargs from 'yargs';
import App from './app';

const options = yargs
 .usage(`Usage:  ${process.argv0} -u <url>`)
 .option('u',
    {
        alias: 'url',
        describe: 'Full Novel URL, e.g. https://wuxiaworld.co/The-Legendary-Mechanic/',
        type: 'string',
        demandOption: true
    })
 .argv;

App(options.u);