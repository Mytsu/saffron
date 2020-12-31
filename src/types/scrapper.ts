import { NovelMetadata, Chapter, Novel } from './novel';

export interface Scrapper {
    url: string;
    getNovelMetadata(data: string): Promise<NovelMetadata>;
    getChapter(url: string): Promise<Chapter>;
    formatChapter(chapter: Chapter): Chapter;
}
