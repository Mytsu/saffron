export type NovelMetadata = {
  url: string;
  title: string;
  author: string;
  coverUrl: string;
  chapterUrls: string[];
}

export type Novel = {
  metadata: NovelMetadata;
  chapters: Chapter[];
}

export type Chapter = {
  title: string;
  content: string;
}
