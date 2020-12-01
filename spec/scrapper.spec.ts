import 'mocha';
import { expect } from 'chai';
import axios from 'axios';
import { WuxiaWorldDotCo } from '../src/scrappers';
import { NovelMetadata, Scrapper } from '../src/types';

describe('WuxiaWorld.co', () => {
    const url = 'https://www.wuxiaworld.co/Supreme-Magus/';
    let scrapper: Scrapper;

    before(() => {
        scrapper = new WuxiaWorldDotCo(url);
    });

    describe('getNovelMetadata', () => {   
        let metadata: NovelMetadata;
        const title = 'Supreme Magus';
        const author = 'Legion20';
    
        before(async () => {
            const { data } = await axios.get(url);
            metadata = await scrapper.getNovelMetadata(data);
        });

        it(`Novel's name should be '${title}`, () => {
            expect(metadata?.title).to.be.equal(title);
        });
    
        it(`Author's name should be '${author}'`, () => {
            expect(metadata?.author).to.be.equal(author);
        });
    });
});
