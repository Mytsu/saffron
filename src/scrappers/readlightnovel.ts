import axios from 'axios';
import cheerio from 'cheerio';
import { NovelMetadata, Chapter, Scrapper } from '../types';

// Details available below the novel cover and star rating
enum NovelDetails {
    Type = 0,
    Genre = 1,
    Tags = 2,
    Language = 3,
    Authors = 4,
    Artists = 5,
    Year = 6,
    Status = 7,
}

export class ReadLightNovelDotOrg implements Scrapper {
    constructor(readonly url: string) {}

    async getNovelMetadata(url: string): Promise<NovelMetadata> {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const title: string = $('.block-title > h1').text();
        const metadata: string[] = [];
        $('.novel-details')
            .find('.novel-detail-body')
            .each((_, elem) => {
                metadata.push($(elem).find('ul > li').text());
            });
        const author = metadata[NovelDetails.Authors];
        const coverUrl: string = $('.novel-cover > a > img').attr('src') || '';
        const chapterLinks: string[] = [];

        $('.tab-content > .tab-pane > .chapter-chs > li > a').each(
            (_, elem) => {
                const link = $(elem).attr('href') || 'Deu Ruim';
                chapterLinks.push(link);
            }
        );

        return { title, author, coverUrl, chapterLinks };
    }

    async getChapter(url: string): Promise<Chapter> {
        try {
            const data = await this.fetchChapter(url);
            const $ = cheerio.load(data);
            const title: string = $('.block-title > h1')
                .children() // Novel title is placed inside an <a> tag
                .remove()
                .end()
                .text()
                .replace(/^\s\S\s/gis, ''); // to remove the title separator

            $('.desc > .apester-media').remove();
            $('.desc > center').remove();
            $('.desc > small').remove();
            $('.desc > script').remove();
            $('.desc > .hidden').remove();
            const content = $('.desc').html() || '';

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
        const title = chapter.title;
        let content = chapter.content
            .normalize('NFKD')
            .replace(/<br>/gm, '\n')
            .replace(/<hr>/gm, '')
            .replace(/<p>/gm, '')
            .replace(/<\/p>/gm, '\n\n')
            //eslint-disable-next-line
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

    async fetchChapter(url: string): Promise<string> {
        const { data } = await axios.get(url);
        return data;
    }
}
