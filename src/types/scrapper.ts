import { NovelMetadata, Chapter, Novel } from './novel';

export interface Scrapper {
    url: string;
    getNovel(): Promise<Novel>;
    getNovelMetadata(data: string): Promise<NovelMetadata>;
    getChapter(url: string): Promise<Chapter>;
    // getChapters(init: number, amount: number): Promise<Novel>;
}
