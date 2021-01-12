import axios from 'axios';
import cheerio from 'cheerio';
import { NovelMetadata, Chapter, Scrapper } from '../types';
import { retry } from '../utils';

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
            chapterLinks: links.reverse(),
        };

        return metadata;
    }
    async getChapter(url: string): Promise<Chapter> {
        try {
            const data = await this.fetchChapter(url);
            const $ = cheerio.load(data);
            const title: string = $(
                '.reading-content > .text-left'
            )
                .children().first().text()
                .replace(/\n/g, '')
                .replace(/\t/g, '')
                .trim();
            const content = $('.reading-content > .text-left')
                .remove('h1')
                .text();
            // if (title === '' || content === '')
            //     console.warn(
            //         `\nChapter ${
            //             title ? title + ' ' : ''
            //         }is empty or there's a parsing error.\n
            //         ${title}\n`
            //     );
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

    async fetchChapter(url: string): Promise<string> {
        const { data } = await retry(5, 5000, url, axios.get);
        return data
    }
}
