import { DOMParser, HTMLDocument } from "../packages.ts";
import type { Chapter, Novel, NovelMetadata } from "../types/Novel.ts";
import type { Scrapper } from "../types/Scrapper.ts";
import { fetchFromAnt } from "../utils/scrapingAntAPI.ts";

export class ReadLightNovel implements Scrapper {
  constructor(
    public readonly url: string,
    public readonly ant: boolean = false,
  ) {}

  async fetchHtml(url: string): Promise<string> {
    if (this.ant) return fetchFromAnt(url);
    return (await fetch(url)).text();
  }

  async getNovel(options?: { init?: number; end?: number }): Promise<Novel> {
    const metadata = this.getNovelMetadata(await this.fetchHtml(this.url));
    const chapters = await this.getChapters(
      metadata.chapterUrls.slice(options?.init, options?.end),
    );
    return { metadata, chapters };
  }

  getNovelMetadata(html: string): NovelMetadata {
    const document = this._parseDocument(html);
    const title = this.getNovelTitle(document);
    const coverUrl = this.getNovelCoverUrl(document);
    const author = this.getNovelAuthor(document);
    const chapterUrls = this.getNovelChapterUrls(document);
    if (!title) throw new Error("Title not found");
    if (!coverUrl) throw new Error("Novel cover not loaded");
    if (!author) console.warn(`${title} author not found`);
    return { url: this.url, title, author, coverUrl, chapterUrls };
  }

  async getChapters(urls: string[]): Promise<Chapter[]> {
    if (!urls.length) return [];
    const chapters = await Promise.all(
      urls.map(async (url, _index) => {
        const html = await this.fetchHtml(url);
        return this._getFormattedChapter(html);
      }),
    );
    return chapters;
  }

  getChapter(html: string): Chapter {
    const document = this._parseDocument(html);
    const title = this.getChapterTitle(document);
    const content = this.getChapterContent(document);
    return { title, content };
  }

  format(chapter: Chapter): Chapter {
    const title = chapter.title.replace(" - ", "");
    let content = chapter.content
      .normalize("NFKD")
      .replace(/<br>/gm, "\n")
      .replace(/<hr>/gm, "")
      .replace(/<p>/gm, "")
      .replace(/<\/p>/gm, "\n\n")
      .replace(/\<script\>ChapterMid\(\);\<\/script\>(\\n)?/gm, "");

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].trim();
    }

    content = lines.join("\n");
    // start of chapter has many new lines to offset the TTS plugin
    content = content.replace(/\n\n\n/gm, "");

    return { title, content };
  }

  async getLength() {
    const metadata = this.getNovelMetadata(await this.fetchHtml(this.url));
    return metadata.chapterUrls.length;
  }

  getNovelTitle(document: HTMLDocument): string {
    return (
      document?.querySelector(".block-title")?.querySelector("h1")
        ?.textContent || ""
    );
  }

  getNovelCoverUrl(document: HTMLDocument): string {
    return (
      document
        ?.querySelector(".novel-cover > a > img")
        ?.attributes.getNamedItem("src").value || ""
    );
  }

  getNovelAuthor(document: HTMLDocument): string {
    return (
      document
        ?.querySelector(".novel-details")
        ?.children.item(4)
        .querySelector(".novel-detail-body > ul > li > a")
        ?.textContent || ""
    );
  }

  getNovelChapterUrls(document: HTMLDocument): string[] {
    const chapterUrls: string[] = [];
    const _links = document.querySelectorAll(
      ".tab-content > .tab-pane > .chapter-chs > li",
    );
    _links.forEach((_node, index) => {
      chapterUrls.push(
        _links.item(index).children.item(0).getAttribute("href") || "",
      );
    });

    return chapterUrls;
  }

  getChapterTitle(document: HTMLDocument): string {
    return document?.querySelector(".block-title > h1")?.textContent || "";
  }

  getChapterContent(document: HTMLDocument): string {
    const content = document.querySelector(".desc");
    content?.querySelectorAll("center, div, h1, h2").forEach((node) => {
      node.remove();
    });
    return content?.innerHTML || "";
  }

  private _parseDocument(html: string): HTMLDocument {
    const document = new DOMParser().parseFromString(html, "text/html");
    if (!document) throw new Error("Failed to parse document");
    return document;
  }
  private _getFormattedChapter(html: string): Chapter {
    return this.format(this.getChapter(html));
  }
}
