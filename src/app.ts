import fs from 'fs';
import axios from 'axios';
import cheerio from 'cheerio';

export interface Novel {
    title: string;
    author: string;
    chapters: Chapter[];
    chapterLinks: string[];
}

export interface Chapter {
    title: string;
    content: string;
}

export const getNovel = async (url: string, dir: string): Promise<void> => {
    const novel = await getNovelMetadata(url);
    if (novel)
        dumpToFile(novel, dir);
};

export const getNovelMetadata = async (url: string): Promise<Novel | null> => {

    try {

        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const title: string = $('.book-name').text();
        const author: string = $('.name').text();
        const chapterLinks: string[] = [];

        $('.chapter-item').each((_, elem) => {
            const link = $(elem).attr('href');
            chapterLinks.push(link || '');
        });

        return { title, author, chapters: [], chapterLinks };

    } catch (err) { console.error(err.message); }

    return null;
};

export const getChapters = async (url: string, novel: Novel): Promise<Novel | null> => {
    const regex = /[^/]*$/;
    if (novel) {
        try {
            for (let index = 0; index < novel.chapterLinks.length; index++) {
                novel.chapters.push(
                    formatChapter(
                        await getChapter(url + regex.exec(novel.chapterLinks[index]))
                    )
                );
            }
            return novel;
        } catch (err) { console.error(err.message); }
    }
    return null;
};

export const getChapter = async (url: string): Promise<Chapter> => {
    const { data: chapter_data } = await axios.get(url);
    const $c = cheerio.load(chapter_data);
    const chapter_title: string = $c('h1.chapter-title').text();
    const chapter_content: string = $c('.chapter-entity').html() || '';

    console.log(chapter_title);

    return { title: chapter_title, content: chapter_content };
};

export const formatChapter = (chapter: Chapter): Chapter => {

    const title = chapter.title;
    let content = chapter.content;

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
};

export const dumpToFile = (novel: Novel, dir: string): void => {
    let data =
        `---
CJKmainfont: Noto Serif CJK TC
---

# ${novel.title}

#### ${novel.author}

`;

    for (let index = 0; index < novel.chapters.length; index++) {
        data +=
            `## ${novel.chapters[index].title}

${novel.chapters[index].content}

`;
    }

    const full_url = `${dir}/${novel.title}.md`;
    fs.writeFile(full_url, data, () => { console.log(`Done! Saved at ${full_url}`) });
};
