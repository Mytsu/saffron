export interface Novel {
    metadata: NovelMetadata
    chapters: Chapter[];
}

export interface NovelMetadata {
    title: string;
    author: string;
    coverUrl: string;
    chapterLinks: string[];
}

export interface Chapter {
    title: string;
    content: string;
}
