import 'mocha';
import * as app from '../src';
import { expect } from 'chai';

describe('Function getNovelMetadata', () => {

    const url = 'https://www.wuxiaworld.co/The-Legendary-Mechanic/';
    const blank: app.Novel = {
        title: '',
        author: '',
        chapters: [],
        chapterLinks: []
    }
    let metadata: app.Novel;

    before(async () => {
        metadata = await app.getNovelMetadata(url) || blank;
    })

    it('Novel Author Should be \'Chocolion\'', () => {
        expect(metadata?.author).to.be.equal('Chocolion');
    })
});