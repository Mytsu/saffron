import 'mocha';
import { expect } from 'chai';
import axios from 'axios';
import { NovelMetadata } from '../src/types';
import { getScrapper } from './../src/app';

let metadata: NovelMetadata;

const testPool = [
    {
        domain: 'WuxiaWorld.co',
        url: 'https://www.wuxiaworld.co/Supreme-Magus/',
        response: { title: 'Supreme Magus', author: 'Legion20' },
    },
    {
        domain: 'ReadLightNovel.org',
        url: 'https://www.readlightnovel.org/supreme-magus',
        response: { title: 'Supreme Magus', author: '' },
    },
];

testPool.forEach((test) => {
    describe(test.domain, () => {
    
        describe('getNovelMetadata', () => {
    
            before(async () => {
                const { data } = await axios.get(test.url);
                metadata = await getScrapper(test.url).getNovelMetadata(data);
            });
    
            it(`Novel's name should be '${test.response.title}`, () => {
                expect(metadata?.title).to.be.equal(test.response.title);
            });
    
            it(`Author's name should be '${test.response.author}'`, () => {
                expect(metadata?.author).to.be.equal(test.response.author);
            });
        });
    });
});
