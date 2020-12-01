import { NovelMetadata, Chapter, Novel } from './novel';

export interface Scrapper {
    getNovel(url: string): Promise<Novel>;
    getNovelMetadata(data: string): Promise<NovelMetadata>;
    getChapter(url: string): Promise<Chapter>;
}
