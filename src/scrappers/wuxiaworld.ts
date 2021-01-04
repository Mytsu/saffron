import axios from 'axios';
import cheerio from 'cheerio';
import { NovelMetadata, Chapter, Scrapper } from '../types';

export class WuxiaWorldDotCo implements Scrapper {
    constructor(readonly url: string) {
        // TODO: Check url protocol and add http if missing
    }

    async getNovelMetadata(data: string): Promise<NovelMetadata> {
        try {
            const $ = cheerio.load(data);
            const title: string = $('.book-name').text();
            const author: string = $('.name').text();
            const coverUrl: string = $('.book-img > img').attr('src') || '';
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
            // url format from input might cause issues with axios.get()
            const { data: chapter_data } = await axios.get(
                `https://${new URL(this.url).hostname}${url}`
            );
            const $c = cheerio.load(chapter_data);
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
}
