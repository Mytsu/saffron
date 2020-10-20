import fs from 'fs';
import axios from 'axios';
import cheerio from 'cheerio';

interface Novel {
    title: string;
    author: string;
    chapters: Chapter[];
}

interface Chapter {
    title: string;
    content: string;
}

export default async (url: string, dir: string): Promise<void> => {
    const novel = await fetch(url);
    if( novel )
        save(novel,dir);
};

const fetch = async (url: string): Promise<Novel | undefined> => {
    
    try {
        
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const chapters: Chapter[] = [];
        const title: string = $('.book-name').text();
        const author: string = $('.name').text();
        const links: string[] = [];
            
        $('.chapter-item').each((index, elem) => {
            const link = $(elem).attr('href');
            links.push(link || '');
        });

        const regex = /[^/]*$/;

        for (let index = 0; index < links.length; index++) {
            
            chapters.push(
                format(
                    await get_chapter(url + regex.exec(links[index]))
                )
            );
        }

        return { title, author, chapters };

    } catch(err) { console.error(err.message); }
};

const get_chapter = async (url: string): Promise<Chapter> => {
    const { data: chapter_data } = await axios.get(url);
    const $c = cheerio.load(chapter_data);
    const chapter_title: string = $c('h1.chapter-title').text();
    const chapter_content: string = $c('.chapter-entity').html() || '';
    
    console.log(chapter_title);

    return { title: chapter_title, content: chapter_content };
};

const format = (chapter: Chapter): Chapter => {
    
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

const save = (novel: Novel, dir: string): void => {
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
