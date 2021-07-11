import type { Novel, NovelMetadata, Chapter } from './Novel.ts';

export type Scrapper = {
  getNovelMetadata(html: string): NovelMetadata;
  getNovel(options?: { init: number; end: number }): Promise<Novel>;
  getChapters(urls: string[]): Promise<Chapter[]>;
  getChapter(html: string): Chapter;
}
