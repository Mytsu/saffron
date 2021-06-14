import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import { NovelMetadata, Chapter, Scrapper } from '../types';

/*
    ranobes.net uses CloudFlare's security measures, which makes axios receive
    only 403 Forbidden responses
**/
export class RanobesDotNet implements Scrapper {
    browser!: puppeteer.Browser;
    constructor(readonly url: string) {
        puppeteer.launch({ headless: true }).then((browser) => {
            this.browser = browser;
        });
    }

    async getNovelMetadata(url: string): Promise<NovelMetadata> {
        try {
            const page = await this.browser.newPage();
            const data = await (await page.goto(url)).text();
            const $ = cheerio.load(data);
            const title: string = $(
                '.r-fullstory-s1 > .r-date > .title'
            ).text();
            const author: string = $(
                '.r-fullstory-s1 > .r-date > .title > .subtitle'
            ).text();
            const coverUrl: string = $(
                '.r-fullstory-poster > .poster > .cover'
            ).css('background-image');
            const chapterLinks: string[] = [];

            $('.chapter-item').each((_, elem) => {
                const link = $(elem).attr('href');
                chapterLinks.push(link || '');
            });

            return { title, author, coverUrl, chapterLinks };
        } catch (e) {
            console.error('getNovelMetadata failed', e);
            process.exit(0);
        }
    }

    async getChapter(url: string): Promise<Chapter> {
        try {
            const data = await this.fetchChapter(url);
            const $c = cheerio.load(data);
            const title: string = $c('h1.chapter-title').text();
            const content: string =
                $c('.chapter-entity').html()?.toString() || '';
            return { title, content };
        } catch (e) {
            console.error('getChapter failed', e);
            process.exit(0);
        }
    }

    formatChapter(chapter: Chapter): Chapter {
        const title = chapter.title;
        let content = chapter.content
            .normalize('NFKD')
            .replace(/<br\s*[/]?>/gi, '\n')
            .replace(/&apos;/gi, "'")
            .replace(/&quot;/gi, '"')
            //eslint-disable-next-line
            .replace(/\<script\>ChapterMid\(\);\<\/script\>(\\n)?/gm, '');

        const lines = content.split('\n');
        lines.splice(lines.length - 5);

        for (let i = 0; i < lines.length; i++) {
            lines[i] = lines[i].trim();
        }

        content = lines.join('\n');
        return { title, content };
    }

    async fetchChapter(url: string): Promise<string> {
        // url format from input might cause issues with axios.get()
        const { data } = await axios.get(
            `https://${new URL(this.url).hostname}${url}`
        );

        return data;
    }
}
