import axios from 'axios';
import cheerio from 'cheerio';
import { NovelMetadata, Chapter, Scrapper } from '../types';

export class BoxNovelDotCom implements Scrapper {
    constructor(readonly url: string) {}

    async getNovelMetadata(data: string): Promise<NovelMetadata> {
        const $ = cheerio.load(data);
        const links: string[] = [];
        $('.version-chap > li.wp-manga-chapter > a').each((_, elem) => {
            links.push($(elem).attr('href') || '');
        });

        const metadata: NovelMetadata = {
            title: $('.post-title > h3')
                .text()
                .replace(/\n/g, '')
                .replace(/\t/g, '')
                .trim(),
            author: $('.author-content')
                .text()
                .replace(/\n/g, '')
                .replace(/\t/g, '')
                .trim(),
            coverUrl:
                $('.summary_image > a > .img-responsive').attr('src') || '',
            chapterLinks: links,
        };

        return metadata;
    }
    async getChapter(url: string): Promise<Chapter> {
        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const title: string = $(
                '.reading-content > .text-left > h1.text-center'
            ).text();
            const content = $('.reading-content > .text-left')
                .remove('h1')
                .text();
            if (title === '' || content === '')
                console.warn(
                    `Chapter ${
                        title ? title + ' ' : ''
                    }is empty or there's a parsing error.\n
                    ${title}:\n${content}`
                );
            return { title, content };
        } catch (e) {
            console.error('getChapter failed', e);
            process.exit(0);
        }
    }
    formatChapter(chapter: Chapter): Chapter {
        chapter.content = chapter.content
            .replace(/\t/g, '')
            .replace(/\n\n\n/g, '')
            .replace(/\n/g, '\n\n')
            .trim();
        return chapter;
    }
}
