import { Element, encodeUrl, HTMLDocument } from "../packages.ts";
import type { Chapter } from "../types/Novel.ts";
import type { ScrapperOptions } from "../types/ScrapperOptions.ts";
import { Scrapper } from "./Scrapper.ts";

export class BoxNovelDotCom extends Scrapper {
  constructor(
    readonly url: string,
    readonly options?: ScrapperOptions,
  ) {
    super(url, options);
  }

  format(chapter: Chapter): Chapter {
    chapter.title = chapter.title.replaceAll("OÇO", "'");
    chapter.content = chapter.content
      .replace(/\t/g, "")
      .replace(/\n\n\n/g, "")
      .replace(/\n/g, "\n\n")
      .trim();
    return chapter;
  }

  getNovelTitle(document: HTMLDocument): string {
    document.querySelector(".post-title > .manga-title-badges")?.remove();
    const title = document
      .querySelector(".post-title > h1")
      ?.textContent.replace(/\n/g, "")
      .replace(/\t/g, "")
      .trim() || "";
    if (this.options?.debug) console.log(title);
    return title;
  }

  getNovelAuthor(document: HTMLDocument): string {
    return (
      document
        .querySelector(".author-content")
        ?.textContent.replace(/\n/g, "")
        .replace(/\t/g, "")
        .trim() || ""
    );
  }

  getNovelCoverUrl(document: HTMLDocument): string {
    const url = document
      .querySelector(".summary_image > a > .img-responsive")
      ?.attributes.getNamedItem("src").value || "";
    if (url) return encodeUrl(url);
    return "";
  }

  async getNovelChapterUrls(): Promise<string[]> {
    const ajax_request_url =
      `${this.url}${(this.url.lastIndexOf("/") === (this.url.length - 1)
        ? ""
        : "/")}ajax/chapters`;
    const result = await this.fetchHtml(ajax_request_url, {
      method: "POST",
      headers: { "User-Agent": "Mozilla 5.0" },
    });
    const document: HTMLDocument = this._parseDocument(result);
    const links: string[] = [];
    document.querySelectorAll("ul.main > li.wp-manga-chapter > a")
      .forEach((node) =>
        links.push((node as Element).attributes.getNamedItem("href").value)
      );
    return links.reverse();
  }

  getChapterTitle(document: HTMLDocument): string {
    return (
      document
        .querySelector(".c-breadcrumb > ol.breadcrumb > li.active")
        ?.textContent.replace(/\n/g, "")
        .replace(/\t/g, "")
        .trim() || ""
    );
  }

  getChapterContent(document: HTMLDocument): string {
    return (
      document.querySelector(".reading-content > .text-left")?.textContent || ""
    );
  }
}
