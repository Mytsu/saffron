import type { Chapter, Novel, NovelMetadata } from "../types/Novel.ts";
import { ScrapperOptions } from "../types/ScrapperOptions.ts";
import {
  DOMParser,
  HTMLDocument,
  ProgressBar,
  retryAsync,
} from "../packages.ts";
import { fetchFromAnt } from "../utils/scrapingAntAPI.ts";
import { getWidth } from "../utils/tty.ts";

export abstract class Scrapper {
  constructor(readonly url: string, readonly options?: ScrapperOptions) {}

  async fetchHtml(url: string): Promise<string> {
    if (this.options?.ant) {
      return fetchFromAnt(url, { apiKey: this.options?.antKey });
    }

    const result = await retryAsync<Response>(async () => await fetch(url), {
      maxTry: 5,
      delay: 5000,
    });
    return result.text();
  }

  async getNovel(options?: { init?: number; end?: number }): Promise<Novel> {
    if (this.options?.debug) console.log("Starting download");
    const metadata = this.getNovelMetadata(await this.fetchHtml(this.url));
    const progressBar = this.options?.silent ? undefined : new ProgressBar({
      title: metadata.title,
      total: metadata.chapterUrls.length,
      display: ":title | :completed/:total [:bar] :percent Elapsed: :time",
      width: await getWidth(),
      clear: true,
    });
    const chapters = await this.getChapters(
      metadata.chapterUrls.slice(options?.init, options?.end),
      progressBar,
    );
    return { metadata, chapters };
  }

  getNovelMetadata(html: string): NovelMetadata {
    if (this.options?.debug) console.log("Fetching novel metadata");
    const document = this._parseDocument(html);
    const title = this.getNovelTitle(document);
    const author = this.getNovelAuthor(document);
    const coverUrl = this.getNovelCoverUrl(document);
    const chapterUrls = this.getNovelChapterUrls(document);
    return { url: this.url, title, author, coverUrl, chapterUrls };
  }

  async getChapters(
    urls: string[],
    progressBar?: ProgressBar,
  ): Promise<Chapter[]> {
    if (!urls.length) return [];
    const title = progressBar?.title;
    const chapters: Chapter[] = [];
    let i: number;
    for (i = 0; i < urls.length; i++) {
      const html = await this.fetchHtml(urls[i]);
      const chapter = this._getFormattedChapter(html);
      if (this.options?.debug) console.log(chapter.title);
      progressBar?.render(i, {
        title: `${title} - ${chapter.title}`,
      });
      chapters.push(chapter);
    }
    return chapters;
  }

  getChapter(html: string): Chapter {
    const document = this._parseDocument(html);
    const title = this.getChapterTitle(document);
    const content = this.getChapterContent(document);
    return { title, content };
  }

  async getLength() {
    const metadata = this.getNovelMetadata(await this.fetchHtml(this.url));
    return metadata.chapterUrls.length;
  }

  _parseDocument(html: string): HTMLDocument {
    const document = new DOMParser().parseFromString(html, "text/html");
    if (!document) throw new Error("Failed to parse document");
    return document;
  }

  _getFormattedChapter(html: string): Chapter {
    return this.format(this.getChapter(html));
  }

  abstract getNovelTitle(document: HTMLDocument): string;
  abstract getNovelAuthor(document: HTMLDocument): string;
  abstract getNovelCoverUrl(document: HTMLDocument): string;
  abstract getNovelChapterUrls(document: HTMLDocument): string[];
  abstract getChapterTitle(document: HTMLDocument): string;
  abstract getChapterContent(document: HTMLDocument): string;
  abstract format(chapter: Chapter): Chapter;
}
