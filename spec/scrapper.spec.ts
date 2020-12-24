import 'mocha';
import { expect } from 'chai';
import axios from 'axios';
import { NovelMetadata, Chapter } from '../src/types';
import { getScrapper, getSupportedDomains } from './../src/app';
import * as responses from './responses.json'

let metadata: NovelMetadata;
const testPool = responses.testPool;

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
});

testPool.forEach((test) => {
    describe(test.domain, () => {
        before(async () => {
            const { data } = await axios.get(test.url);
            const scrapper = getScrapper(test.url);
            metadata = await scrapper.getNovelMetadata(data);
        });

        describe('getNovelMetadata', () => {
            it(`Novel's name should be '${test.response.title}'`, () => {
                expect(metadata?.title).to.be.equal(test.response.title);
            });

            it(`Author's name should be '${test.response.author}'`, () => {
                expect(metadata?.author).to.be.equal(test.response.author);
            });

            if (test.response.coverUrl) {
                it(`Should return the cover image url`, () => {
                    expect(metadata.coverUrl).to.be.equal(
                        test.response.coverUrl
                    );
                });
            }

            it(`Should have chapter links`, () => {
                expect(metadata?.chapterLinks).to.have.length.above(0);
            });

            test.response.chapterLinks.forEach((url, index) => {
                it(`${
                    index + 1
                }. Should have nth chapter link matching sample`, () => {
                    expect(metadata.chapterLinks).to.include(url);
                });
            });
        });

        describe('getChapter', () => {
            const scrapper = getScrapper(test.url);

            it('Should fetch a chapter succesfully', async () => {
                let raw_chapter: Chapter;
                if (test.domain === 'WuxiaWorld.co') {
                    /* 
                    If the protocol is not specified, axios makes the request to
                    localhost, which isn't possible when running CI tests or 
                    cloud functions; and on local tests it throws ECONNREFUSED
                    more often than not.
                    **/
                    raw_chapter = await scrapper.getChapter(
                        'https://www.' + test.domain + metadata.chapterLinks[0]
                    );
                } else {
                    raw_chapter = await scrapper.getChapter(
                        metadata.chapterLinks[0]
                    );
                }

                const chapter = scrapper.formatChapter(raw_chapter);
                console.log(chapter);

                expect(chapter).to.not.be.null;
            });
        });
    });
});
