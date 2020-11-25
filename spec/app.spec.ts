import 'mocha';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import {
    Novel,
    getNovelMetadata
} from '../src';

describe('Function getNovelMetadata', () => {

    let novel: Novel;
    let data: string;

    const authorName = 'Legion20';

    before(async () => {
        data = fs.readFileSync(path.resolve('./samples/Supreme_Magus.html')).toString('utf-8');
        novel = await getNovelMetadata(data);
    })

    it(`Author's name should be '${authorName}'`, () => {
        expect(novel?.author).to.be.equal(authorName);
    })
});