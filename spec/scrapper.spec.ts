import 'mocha';
import { expect } from 'chai';
import axios from 'axios';
import { NovelMetadata } from '../src/types';
import { getScrapper } from './../src/app';

let metadata: NovelMetadata;
const title = 'Supreme Magus';
const author = 'Legion20';

describe('WuxiaWorld.co', () => {
    const url = 'https://www.wuxiaworld.co/Supreme-Magus/';

    describe('getNovelMetadata', () => {

        before(async () => {
            const { data } = await axios.get(url);
            metadata = await getScrapper(url).getNovelMetadata(data);
        });

        it(`Novel's name should be '${title}`, () => {
            expect(metadata?.title).to.be.equal(title);
        });

        it(`Author's name should be '${author}'`, () => {
            expect(metadata?.author).to.be.equal(author);
        });
    });
});

describe('ReadLightNovel.org', () => {
    const url = 'https://www.readlightnovel.org/supreme-magus';

    describe('getNovelMetadata', () => {
        before(async () => {
            const { data } = await axios.get(url);
            metadata = await getScrapper(url).getNovelMetadata(data);
        });

        it(`Novel's name should be '${title}`, () => {
            expect(metadata?.title).to.be.equal(title);
        });
    });
});