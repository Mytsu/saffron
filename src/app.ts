import fs from 'fs';
import ProgressBar from 'cli-progress';
import {
    WuxiaWorldDotCo,
    ReadLightNovelDotOrg,
    BoxNovelDotCom,
} from './scrappers';
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

        case Domains.BoxNovel: {
            return new BoxNovelDotCom(url);
        }

        default:
            throw 'URL domain not supported.';
    }
};

export const getNovel = async (url: string): Promise<Novel> => {
    const scrapper = getScrapper(url);
    try {
        const metadata = await scrapper.getNovelMetadata();
        const novel = await getChapters(scrapper, metadata);
        return novel;
    } catch (e) {
        console.error('getNovel failed', { url: scrapper.url, error: e });
        process.exit(0);
    }
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

export const getChapters = async (
    scrapper: Scrapper,
    metadata: NovelMetadata
): Promise<Novel> => {
    const chapters: Chapter[] = [];
    const bar = new ProgressBar.SingleBar({
        format: 'Progress |{bar}| {percentage}% || {title}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true,
    });
    try {
        bar.start(metadata.chapterLinks.length, 0, { title: 'N/A' });
        for (let index = 0; index < metadata.chapterLinks.length; index++) {
            const chapter = await scrapper.getChapter(
                metadata.chapterLinks[index]
            );
            chapters.push(scrapper.formatChapter(chapter));

            bar.increment({ title: chapters[index].title });
        }
        bar.stop();
        return { metadata, chapters };
    } catch (err) {
        console.error('getChapters failed', err);
        process.exit(0);
    }
};
