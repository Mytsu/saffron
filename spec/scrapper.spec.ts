import 'mocha';
import { expect } from 'chai';
// import axios from 'axios';
import puppeteer from 'puppeteer';
import { NovelMetadata } from '../src/types';
import { getScrapper, getSupportedDomains } from '../src/app';
import * as responses from './responses.json';

type TestResponse = {
    title: string;
    author: string;
    coverUrl: string;
    chapterLinks: string[];
};

type Test = {
    domain: string;
    url: string;
    response: TestResponse;
};

const testPool: Test[] = responses.testPool;
let metadata: NovelMetadata;

describe('Supported Domains', () => {
    let domains: string[];

    before(() => {
        domains = getSupportedDomains();
    });

    it('ReadLightNovel.org', () => {
        expect(domains).to.contain('readlightnovel.org');
    });

    it('WuxiaWorld.co', () => {
        expect(domains).to.contain('wuxiaworld.co');
    });

    it('BoxNovel.com', () => {
        expect(domains).to.contain('boxnovel.com');
    });

    it('Ranobes.net', () => {
        expect(domains).to.contain('ranobes.net');
    });
});

testPool.forEach((test: Test) => {
    let browser: puppeteer.Browser;
    let page: puppeteer.Page;
    describe(test.domain, () => {
        before(async () => {
            // const { data } = await axios.get(test.url);
            browser = await puppeteer.launch({
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
                ],
            });
            page = await browser.newPage();
            await page.setJavaScriptEnabled(true);
            const data = await page.goto(test.url);
            metadata = await getScrapper(test.url)
                .getNovelMetadata(await data.text());
        });

        after(async () => {
            await page.close();
            await browser.close();
        })

        describe('getNovelMetadata', () => {
            it(`Novel's name should be '${test.response.title}'`, () => {
                expect(metadata.title).to.be.equal(test.response.title);
            });

            it(`Author's name should be '${test.response.author}'`, () => {
                expect(metadata.author).to.be.equal(test.response.author);
            });

            if (test.response.coverUrl) {
                it(`Should return the cover image url`, () => {
                    expect(metadata.coverUrl).to.be.equal(
                        test.response.coverUrl
                    );
                });
            }

            it(`Should have chapter links`, () => {
                expect(metadata.chapterLinks).to.have.length.above(0);
            });

            test.response.chapterLinks.forEach((url, index) => {
                it(`${
                    index + 1
                }. Should have nth chapter link matching sample`, () => {
                    expect(metadata.chapterLinks).to.include(url);
                });
            });
        });

        /* 
        describe('getChapter', () => {
            const scrapper = getScrapper(test.url);

            it('Should fetch a chapter succesfully', async () => {
                const raw_chapter = await scrapper.getChapter(
                    metadata.chapterLinks[0]
                );

                const chapter = scrapper.formatChapter(raw_chapter);
                expect(chapter).to.not.be.null;
            });
        });
        */
    });
});
