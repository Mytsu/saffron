import 'mocha';
import { expect } from 'chai';
import axios from 'axios';
import { NovelMetadata } from '../src/types';
import { getScrapper, getSupportedDomains } from './../src/app';

let metadata: NovelMetadata;

const testPool = [
    {
        domain: 'WuxiaWorld.co',
        url: 'https://www.wuxiaworld.co/Supreme-Magus/',
        response: {
            title: 'Supreme Magus',
            author: 'Legion20',
            coverUrl:
                'https://img.wuxiaworld.co/BookFiles/BookImages/Supreme-Magus.jpg',
            // Specific domain formats links without the domain
            first_chapterLink:
                '/Supreme-Magus/2114127.html',
        },
    },
    {
        domain: 'ReadLightNovel.org',
        url: 'https://www.readlightnovel.org/supreme-magus',
        // RLN doesn't provide correct metadata for most novels
        response: {
            title: 'Supreme Magus',
            author: 'N/A',
            coverUrl:
                'https://www.readlightnovel.org/uploads/posters/1554422569.jpg',
            first_chapterLink:
                'https://www.readlightnovel.org/supreme-magus/chapter-prologue',
        },
    },
];

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
        describe('getNovelMetadata', () => {
            before(async () => {
                const { data } = await axios.get(test.url);
                metadata = await getScrapper(test.url).getNovelMetadata(data);
            });

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

            it(`Should have first chapter link matching sample`, () => {
                expect(metadata?.chapterLinks[0]).to.be.equal(
                    test.response.first_chapterLink
                );
            });
        });
    });
});
