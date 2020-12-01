import { WuxiaWorldDotCo } from './scrappers/wuxiaworld.co';
import fs from 'fs';
import { Novel } from './types';

export const getNovel = async (url: string): Promise<Novel> => {
    // TODO: match url to respective scrapper
    const scrapper = new WuxiaWorldDotCo();
    const novel = scrapper.getNovel(url);
    return novel;
};

export const toMarkdown = (novel: Novel): string => {
        let data = `---
CJKmainfont: Noto Serif CJK TC
---

# ${novel.metadata.title}

#### ${novel.metadata.author}

`;

        for (let index = 0; index < novel.chapters.length; index++) {
            data += `## ${novel.chapters[index].title}

${novel.chapters[index].content}

`;
        }

        return data;
    }

export const dumpToFile = (
    novel: Novel,
    dir: string
): void => {
    const data = toMarkdown(novel);

    const full_url = `${dir}/${novel.metadata.title}.md`;
    fs.writeFile(full_url, data, () => {
        console.log(`Done! Saved at ${full_url}`);
    });
};
