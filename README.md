# Saffron web novel scrapper

A web-scrapper to fetch web novels, supported domains being updated not so often.

## Usage

Download the binaries for your operating system from the [releases](./releases) page.
And run the binary on your terminal with:

`saffron --help`

## Run from source

As one of the features of Deno, you can execute code from the web with `deno run`, so running `deno run --allow-net --allow-read --allow-write https://raw.githubusercontent.com/Mytsu/saffron/master/cli.ts get https://www.readlightnovel.me/the-legendary-mechanic --json` will get the job done without any (manual) downloads.

## Compile from source

Run `deno compile --allow-net --allow-read --allow-write https://github.com/Mytsu/saffron/raw/master/cli.ts`
