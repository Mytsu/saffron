import axios from 'axios';
import cheerio from 'cheerio';
import { Novel, NovelMetadata, Chapter, Scrapper } from '../types';

export class WuxiaWorldDotCo implements Scrapper {
    constructor(readonly url: string) {}

    async getNovel(): Promise<Novel> {
        const { data } = await axios.get(this.url);
        const metadata = await this.getNovelMetadata(data);
        const novel = await this.getChapters(metadata);
        return novel;
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
        } catch (err) {
            throw err.message;
        }
    }

    async getChapters(metadata: NovelMetadata): Promise<Novel> {
        const regex = /[^/]*$/;
        const chapters: Chapter[] = [];
        try {
            for (let index = 0; index < metadata.chapterLinks.length; index++) {
                chapters.push(
                    this.formatChapter(
                        await this.getChapter(
                            this.url + regex.exec(metadata.chapterLinks[index])
                        )
                    )
                );

                // TODO: count chapters loaded, like a progress bar
                console.log(chapters[index].title);
            }
            return { metadata, chapters };
        } catch (err) {
            throw err.message;
        }
    }

    async getChapter(url: string): Promise<Chapter> {
        const { data: chapter_data } = await axios.get(url);
        const $c = cheerio.load(chapter_data);
        const title: string = $c('h1.chapter-title').text();
        const content: string = $c('.chapter-entity').html()?.toString() || '';

        // TODO: if empty content, log a report of defective chapter to user

        return { title, content };
    }

    formatChapter(chapter: Chapter): Chapter {
        const title = chapter.title;
        let content = chapter.content;
        // TODO: remove ads scripts from content
        content = content.replace(/<br\s*[/]?>/gi, '\n');
        content = content.replace(/&apos;/gi, "'");
        content = content.replace(/&quot;/gi, '"');
        content = content.normalize('NFKD');

        const lines = content.split('\n');
        lines.splice(lines.length - 5);

        for (let i = 0; i < lines.length; i++) {
            lines[i] = lines[i].trim();
        }

        content = lines.join('\n');
        return { title, content };
    }
}
