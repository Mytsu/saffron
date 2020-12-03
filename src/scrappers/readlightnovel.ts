import axios from 'axios';
import cheerio from 'cheerio';
import { Novel, NovelMetadata, Chapter, Scrapper } from '../types';

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

    async getNovel(): Promise<Novel> {
        const { data } = await axios.get(this.url);
        const metadata = await this.getNovelMetadata(data);
        const novel = await this._getChapters(metadata);
        return novel;
    }

    async getNovelMetadata(data: string): Promise<NovelMetadata> {
        try {
            const $ = cheerio.load(data);
            const title: string = $('.block-title > h1').text();
            // TODO: Tests printing empty strings instead of 'N/A'
            const metadata: string[] = [];
            $('.novel-details')
                .find('.novel-detail-body')
                .each(() => {
                    metadata.push($(this).find('ul > li').text());
                });
            const author = metadata[NovelDetails.Authors];
            const coverUrl: string = $('.book-img > img').attr('src') || '';
            const chapterLinks: string[] = [];
            // TODO: Rewrite the chapterLinks scrapper
            // $('.chapter-item').each((_, elem) => {
            //     const link = $(elem).attr('href');
            //     chapterLinks.push(link || '');
            // });

            return { title, author, coverUrl, chapterLinks };
        } catch (err) {
            throw err.message;
        }
    }

    async _getChapters(metadata: NovelMetadata): Promise<Novel> {
        const regex = /[^/]*$/;
        const chapters: Chapter[] = [];
        try {
            for (let index = 0; index < metadata.chapterLinks.length; index++) {
                chapters.push(
                    this._formatChapter(
                        await this.getChapter(
                            this.url + regex.exec(metadata.chapterLinks[index])
                        )
                    )
                );
            }
            return { metadata, chapters };
        } catch (err) {
            throw err.message;
        }
    }

    async getChapter(url: string): Promise<Chapter> {
        const { data: chapter_data } = await axios.get(url);
        const $ = cheerio.load(chapter_data);
        // TODO: Rewrite getChapter
        const title: string = $('h1.chapter-title').text();
        const content: string = $('.chapter-entity').html()?.toString() || '';

        if (title === '' || content === '')
            console.warn(
                `Chapter ${title? title + ' ' : ''}is empty or there's a parsing error.`
            );

        return { title, content };
    }

    _formatChapter(chapter: Chapter): Chapter {
        const title = chapter.title;
        let content = chapter.content;
        // TODO: remove ads scripts from content
        content = content.replace(/<br\s*[/]?>/gi, '\n');
        content = content.replace(/&apos;/gi, "'");
        content = content.replace(/&quot;/gi, '"');
        content = content.normalize();

        const lines = content.split('\n');
        lines.splice(lines.length - 5);

        for (let i = 0; i < lines.length; i++) {
            lines[i] = lines[i].trim();
        }

        content = lines.join('\n');
        return { title, content };
    }
}
