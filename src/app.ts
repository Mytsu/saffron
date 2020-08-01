import * as puppeteer from 'puppeteer';

export default async (url: string): Promise<void> => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    // TODO: filter novel data

    // TODO: go into each chapter's page and filter the data

    // TODO: build the Markdown file with the data
}