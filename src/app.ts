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

export default async (url: string): Promise<void> => {
    try {
        const browser = await puppeteer.launch();
        const novelPage = await browser.newPage();
        const chapterPage = await browser.newPage();

        await novelPage.goto(url).catch(e => console.log(e));

        const novel = await novelPage.evaluate( () => {
            let title = document.querySelector('#info > h1')?.textContent;
                title = !!title ? title : '';
            let author = document.querySelector('#info > p')?.textContent?.split('：')[1];
                author = !!author ? author : '';

            let chapterLinks: string[] = [];
            let query = document.querySelectorAll('#list > dl > dd > a')
            for (let index = 0; index < query.length; index++) {
                const link = query[index].getAttribute('href');
                chapterLinks.push( !!link ? link : '' );
            }

            return { title, author, chapterLinks } as Novel;
        });

        console.log(`Fetching novel: ${novel.title}`);

        let chapters: Chapter[] = [];
        
        for (let index = 0; index < novel.chapterLinks.length; index++) {
            await chapterPage.goto(`${url}${novel.chapterLinks[index]}`).catch(e => console.log(e));
            chapters.push(await chapterPage.evaluate( () => {
                let title = document.querySelector('.bookname > h1')?.textContent;
                    title = !!title ? title : '';
                let content = document.querySelector('#content')
                    ?.textContent
                    ?.replace(/<br\s*[\/]?>/gi, "\n");
                content = !!content ? content : '';
                return { title, content } as Chapter;
            }));

            console.log(`Chapter fetched: ${chapters[index].title}`);

        }

        console.log(`Writing data to file ${novel.title}.md`)

        let data = `---
        CJKmainfont: Noto Serif CJK TC
        ---
        
        # ${novel.title}
        
        ##### ${novel.author}
        
        `;

        for (let index = 0; index < chapters.length; index++) {
            data.concat(`## ${chapters[index].title}
            
            ${chapters[index].content}
            
            `);            
        }

        fs.writeFileSync(`${novel.title}.md`, data);

        browser.close();
    } catch(err) { console.error(err); }
    
}