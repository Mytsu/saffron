import { WuxiaWorldDotCo } from '../src/scrappers';
import 'mocha';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { NovelMetadata, Scrapper } from '../src/types';

describe('WuxiaWorld.co', () => {
    let scrapper: Scrapper
    before(() => {
        scrapper = new WuxiaWorldDotCo();
    });
    describe('Function getNovelMetadata', () => {
        let metadata: NovelMetadata;
        let data: string;
    
        const authorName = 'Legion20';
    
        before(async () => {
            data = fs
                .readFileSync(path.resolve('./samples/Supreme_Magus.html'))
                .toString('utf-8');
            metadata = await scrapper.getNovelMetadata(data);
        });
    
        it(`Author's name should be '${authorName}'`, () => {
            expect(metadata?.author).to.be.equal(authorName);
        });
    });
});
