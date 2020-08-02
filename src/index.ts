import yargs from 'yargs';
import App from './app';

/*
const options = yargs
 .usage(`Usage:  ${process.argv[1]} -u <url>`)
 .option('u',
    {
        alias: 'url',
        describe: 'Full Novel URL, e.g. https://wuxiaworld.co/The-Legendary-Mechanic/',
        type: 'string',
        demandOption: true
    })
 .argv;

App(options.u);

**/

// TODO: setup yargs again

App('https://www.wuxiaworld.co/Strongest-Abandoned-Son/');
