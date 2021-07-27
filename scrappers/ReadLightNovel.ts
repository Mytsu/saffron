import { encodeUrl, HTMLDocument } from '../packages.ts';
import type { Chapter } from '../types/Novel.ts';
import { Scrapper, ScrapperOptions } from '../types/Scrapper.ts';

export class ReadLightNovelDotOrg extends Scrapper {
  constructor(readonly url: string, readonly options?: ScrapperOptions) {
    super(url, options);
  }

  format(chapter: Chapter): Chapter {
    const title = chapter.title.replace(/.*\s-\s/g, '');
    let content = chapter.content
      .normalize('NFKD')
      .replace(/<br>/gm, '\n')
      .replace(/<hr>/gm, '')
      .replace(/<p>/gm, '')
      .replace(/<\/p>/gm, '\n\n')
      .replace(/\<script\>ChapterMid\(\);\<\/script\>(\\n)?/gm, '');

    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].trim();
    }

    content = lines.join('\n');
    // start of chapter has many new lines to offset the TTS plugin
    content = content.replace(/\n\n\n/gm, '');

    return { title, content };
  }

  getNovelTitle(document: HTMLDocument): string {
    return (
      document?.querySelector('.block-title')?.querySelector('h1')
        ?.textContent || ''
    );
  }

  getNovelCoverUrl(document: HTMLDocument): string {
    return encodeUrl(
      document
        ?.querySelector('.novel-cover > a > img')
        ?.attributes.getNamedItem('src').value || '',
    );
  }

  getNovelAuthor(document: HTMLDocument): string {
    return (
      document
        ?.querySelector('.novel-details')
        ?.children.item(4)
        .querySelector('.novel-detail-body > ul > li > a')?.textContent || ''
    );
  }

  getNovelChapterUrls(document: HTMLDocument): string[] {
    const chapterUrls: string[] = [];
    const _links = document.querySelectorAll(
      '.tab-content > .tab-pane > .chapter-chs > li',
    );
    _links.forEach((_node, index) => {
      chapterUrls.push(
        encodeUrl(
          _links.item(index).children.item(0).getAttribute('href') || '',
        ),
      );
    });

    return chapterUrls;
  }

  getChapterTitle(document: HTMLDocument): string {
    return document?.querySelector('.block-title > h1')?.textContent || '';
  }

  getChapterContent(document: HTMLDocument): string {
    const content = document.querySelector('.desc');
    content?.querySelectorAll('center, div, h1, h2').forEach((node) => {
      node.remove();
    });
    return content?.innerHTML || '';
  }
}
