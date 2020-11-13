#!/usr/bin/env node

import yargs from 'yargs';
import { getNovel } from './app';
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

getNovel(options.u, options.d ? options.d : path.resolve(__dirname));