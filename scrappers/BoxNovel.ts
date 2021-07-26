import {
  DOMParser,
  Element,
  encodeUrl,
  HTMLDocument,
  retryAsync,
} from '../packages.ts';
import { Chapter, Novel, NovelMetadata } from '../types/Novel.ts';
import { Scrapper } from '../types/Scrapper.ts';
import { fetchFromAnt } from '../utils/scrapingAntAPI.ts';

export class BoxNovelDotCom implements Scrapper {
  constructor(
    readonly url: string,
    readonly options?: { ant?: boolean; antKey?: string; debug?: boolean },
  ) {}

  async fetchHtml(url: string): Promise<string> {
    if (this.options?.ant)
      return fetchFromAnt(url, { apiKey: this.options?.antKey });

    const result = await retryAsync<Response>(async () => await fetch(url), {
      maxTry: 5,
      delay: 5000,
    });
    return result.text();
  }

  async getNovel(options?: { init?: number; end?: number }): Promise<Novel> {
    if (this.options?.debug) console.log('Starting download');
    const metadata = this.getNovelMetadata(await this.fetchHtml(this.url));
    const chapters = await this.getChapters(
      metadata.chapterUrls.slice(options?.init, options?.end),
    );
    return { metadata, chapters };
  }

  getNovelMetadata(html: string): NovelMetadata {
    const document = this._parseDocument(html);
    const title = this.getNovelTitle(document);
    const author = this.getNovelAuthor(document);
    const coverUrl = this.getNovelCoverUrl(document);
    const chapterUrls = this.getNovelChapterUrls(document);
    return { url: this.url, title, author, coverUrl, chapterUrls };
  }

  async getChapters(urls: string[]): Promise<Chapter[]> {
    /**
      * The 'await Promise.all()' approach doesn't allow for an interactive and
      * synchronous update of the current progress of the download
      * 
    */
    if (!urls.length) return [];
    const chapters = await Promise.all(
      urls.map(async (url, _index) => {
        const html = await this.fetchHtml(url);
        return this._getFormattedChapter(html);
      }),
    );
    return chapters;
    /*
    if (!urls.length) return [];
    const chapters: Chapter[] = [];
    for (let i = 0; i < urls.length; i++) {
      const html = await this.fetchHtml(urls[i]);
      const chapter = this._getFormattedChapter(html);
      // TODO: Iterate progress bar
      if (this.options?.debug) console.log(chapter.title);
      chapters.push(chapter);
    }
    return chapters;
    */
  }

  getChapter(html: string): Chapter {
    const document = this._parseDocument(html);
    const title = this.getChapterTitle(document);
    const content = this.getChapterContent(document);
    return { title, content };
  }

  format(chapter: Chapter): Chapter {
    chapter.content = chapter.content
      .replace(/\t/g, '')
      .replace(/\n\n\n/g, '')
      .replace(/\n/g, '\n\n')
      .trim();
    return chapter;
  }

  getNovelTitle(document: HTMLDocument): string {
    const title =
      document
        .querySelector('.post-title > h3')
        ?.textContent.replace(/\n/g, '')
        .replace(/\t/g, '')
        .trim() || '';

    if (this.options?.debug) console.log(title);

    return title;
  }

  getNovelAuthor(document: HTMLDocument): string {
    return (
      document
        .querySelector('.author-content')
        ?.textContent.replace(/\n/g, '')
        .replace(/\t/g, '')
        .trim() || ''
    );
  }

  getNovelCoverUrl(document: HTMLDocument): string {
    const url =
      document
        .querySelector('.summary_image > a > .img-responsive')
        ?.attributes.getNamedItem('src').value || '';
    if (url) return encodeUrl(url);
    return '';
  }

  getNovelChapterUrls(document: HTMLDocument): string[] {
    const links: string[] = [];
    document
      .querySelectorAll('.version-chap > li.wp-manga-chapter > a')
      .forEach((node, _index, _nodeList) =>
        links.push(
          (node as Element).attributes.getNamedItem('href').value || '',
        ),
      );
    return links.reverse();
  }

  getChapterTitle(document: HTMLDocument): string {
    return (
      document
        .querySelector('.c-breadcrumb > ol.breadcrumb > li.active')
        ?.textContent.replace(/\n/g, '')
        .replace(/\t/g, '')
        .trim() || ''
    );
  }

  getChapterContent(document: HTMLDocument): string {
    return (
      document.querySelector('.reading-content > .text-left')?.textContent || ''
    );
  }

  private _parseDocument(html: string): HTMLDocument {
    const document = new DOMParser().parseFromString(html, 'text/html');
    if (!document) throw new Error('Failed to parse document');
    return document;
  }
  private _getFormattedChapter(html: string): Chapter {
    return this.format(this.getChapter(html));
  }
}
