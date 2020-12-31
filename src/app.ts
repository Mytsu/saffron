import fs from 'fs';
import axios from 'axios';
import { WuxiaWorldDotCo, ReadLightNovelDotOrg } from './scrappers';
import { Novel, Scrapper, Domains, NovelMetadata, Chapter } from './types';

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
    const scrapper = getScrapper(url);
    try {
        const { data } = await axios.get(scrapper.url);
        const metadata = await scrapper.getNovelMetadata(data);
        const novel = await getChapters(scrapper, metadata);
        return novel;
    } catch(e) {
        console.error({ url: scrapper.url, error: e })
    }
    throw('getNovel failed');
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

    fs.writeFile(dir, data, () => {
        console.log(`Done! Saved at ${dir}`);
    });
};

export const getSupportedDomains = (): string[] => {
    return Object.values(Domains);
};

export const getChapters = async (scrapper: Scrapper, metadata: NovelMetadata): Promise<Novel> => {
    const chapters: Chapter[] = [];
    try {
        for (let index = 0; index < metadata.chapterLinks.length; index++) {
            chapters.push(
                scrapper.formatChapter(
                    await scrapper.getChapter(metadata.chapterLinks[index])
                )
            );
            console.log(chapters[index].title);
        }
        return { metadata, chapters };
    } catch (err) {
        console.error(err);
    }
    throw('getChapters failed');
}