import { encodeUrl, HTMLDocument, Element } from '../packages.ts';
import type { Chapter } from '../types/Novel.ts';
import type { ScrapperOptions } from '../types/ScrapperOptions.ts';
import { Scrapper } from './Scrapper.ts';

export class WuxiaWorldDotCo extends Scrapper {
  baseUrl = "https://www.wuxiaworld.co";
  constructor(readonly url: string, readonly options?: ScrapperOptions) {
    super(url, options);
  }

  getNovelTitle(document: HTMLDocument): string {
    return document.querySelector('.book-name')?.textContent || '';
  }

  getNovelAuthor(document: HTMLDocument): string {
    return document.querySelector('.author > .name')?.textContent || '';
  }

  getNovelCoverUrl(document: HTMLDocument): string {
    return encodeUrl(
      document.querySelector('.book-img > img')?.attributes.getNamedItem('src')
        .value || '',
    );
  }

  getNovelChapterUrls(document: HTMLDocument): string[] {
    const urls: string[] = [];
    document
      .querySelectorAll('.chapter-list > .chapter-item')
      .forEach((node) => {
        const chapterUrlSlice =
          (node as Element).attributes.getNamedItem('href').value ?? '';
        urls.push(encodeUrl(this.baseUrl + chapterUrlSlice));
      });
    return urls;
  }

  getChapterTitle(document: HTMLDocument): string {
    return document.querySelector('.chapter-title')?.textContent ?? '';
  }

  getChapterContent(document: HTMLDocument): string {
    return document.querySelector('.chapter-entity')?.innerHTML ?? '';
  }

  format(chapter: Chapter): Chapter {
    return {
      title: chapter.title,
      content: chapter.content
        .replace(/<br>/gm, '\n')
        .replace(/<script>ChapterMid\(\);<\/script>/gm, ''),
    };
  }
}
