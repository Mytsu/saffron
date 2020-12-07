import fs from 'fs';
import { WuxiaWorldDotCo, ReadLightNovelDotOrg } from './scrappers';
import { Novel, Scrapper, Domains } from './types';

export const getScrapper = (url: string): Scrapper => {
    const hostname = new URL(url).hostname.replace('www.', '');

    switch (hostname) {
        case Domains.WuxiaWorldCo: {
            return new WuxiaWorldDotCo(url);
        }

        case Domains.ReadLightNovel: {
            return new ReadLightNovelDotOrg(url);
        }

        default:
            throw 'URL domain not supported.';
    }
};

export const getNovel = async (url: string): Promise<Novel> => {
    const novel = await getScrapper(url).getNovel();
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
};

export const dumpToFile = (novel: Novel, dir: string): void => {
    const data = toMarkdown(novel);

    const full_url = `${dir}/${novel.metadata.title}.md`;
    fs.writeFile(full_url, data, () => {
        console.log(`Done! Saved at ${full_url}`);
    });
};

export const getSupportedDomains = (): string[] => {
    return Object.values(Domains);
};
