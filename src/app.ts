import fs from 'fs';
import puppeteer from 'puppeteer'

interface Novel {
    title: string;
    author: string;
    chapterLinks: string[];
}

interface Chapter {
    title: string;
    content: string;
}

export default async (url: string, dir: string): Promise<void> => {
    try {
        const browser = await puppeteer.launch();
        const novelPage = await browser.newPage();
        const chapterPage = await browser.newPage();

        await novelPage.goto(url).catch(e => console.log(e));

        const novel = await novelPage.evaluate( () => {
            let title = document.querySelector('#info > h1')?.textContent;
                title = title ? title : 'DEU';
            let author = document.querySelector('#info > p')?.textContent?.split('：')[1];
                author = author ? author : 'MUITA';

            const chapterLinks: string[] = [];
            const query = document.querySelectorAll('#list > dl > dd > a')
            for (let index = 0; index < query.length; index++) {
                const link = query[index].getAttribute('href');
                chapterLinks.push( link ? link : 'MERDA' );
            }

            return { title, author, chapterLinks } as Novel;
        });

        console.log(`Fetching novel: ${novel.title}`);

        let data = 
`---
CJKmainfont: Noto Serif CJK TC
---

# ${novel.title}

##### ${novel.author}

`;

        let chapter: Chapter;
        
        for (let index = 0; index < novel.chapterLinks.length; index++) {
            await chapterPage.goto(`${url}${novel.chapterLinks[index]}`).catch(e => console.log(e));
            chapter = await chapterPage.evaluate( () => {
                let title = document.querySelector('.bookname > h1')?.textContent;
                    title = title ? title : 'DEU';
                let content = document.querySelector('#content')
                    ?.textContent
                    ?.replace(/<\s*br\s*\/?>/gi, "\n");
                content = content ? content : 'MERDA';

                content.replace('(adsbygoogle = window.adsbygoogle || []).push({});', '');
                content.replace('ChapterMid();', '');
                content.replace('chaptererror();', '');

                return { title, content } as Chapter;
            });

            console.log(`Chapter fetched: ${chapter.title}`);
            
            data = data +
`## ${chapter.title}

${chapter.content}

`;
        }

        console.log(`Writing data to file ${dir}\\${novel.title}.md`)
        fs.writeFileSync(`${dir}\\${novel.title}.md`, data);

        browser.close();
    } catch(err) { console.error(err); }
    
}