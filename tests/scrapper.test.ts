import { assert, assertEquals } from "./packages.ts";
import getScrapper from "../utils/getScrapper.ts";

type Test = {
  url: string;
  title: string;
  author: string;
  coverUrl: string;
  randomChapterUrl: string;
  randomChapterContent: string;
  chapterTitles: string[];
};

type TestSet = {
  domain: string;
  data: Test;
};

const currentDir = new URL(".", import.meta.url);
const testSets = [
  {
    domain: "ReadLightNovel",
    data: JSON.parse(
      Deno.readTextFileSync(
        `${currentDir.pathname}/data/readlightnovel.testset.json`,
      ),
    ),
  },
  {
    domain: "WuxiaWorld.co",
    data: JSON.parse(
      Deno.readTextFileSync(
        `${currentDir.pathname}/data/wuxiaworlddotco.testset.json`,
      ),
    ),
  },
  {
    domain: "BoxNovel.com",
    data: JSON.parse(
      Deno.readTextFileSync(
        `${currentDir.pathname}/data/boxnovel.testset.json`,
      ),
    ),
  },
];

/**
 * TODO: Fix test loop for all Scrapper instances
 * Deno currently has no support for looping through tests using
 * an async callback.
 */
const testSet = testSets[testSets.length - 1];
const url = testSet.data.url;
const scrapper = getScrapper(url, { ant: false, debug: true });
const novel = await scrapper.getNovel({ init: 0, end: 10 });

Deno.test(`${testSet.domain} metadata`, () => {
  assertEquals(novel.metadata.title, testSet.data.title, "title");
  assertEquals(novel.metadata.author, testSet.data.author, "author");
  assertEquals(novel.metadata.coverUrl, testSet.data.coverUrl, "coverUrl");
  assert(
    novel.metadata.chapterUrls.includes(testSet.data.randomChapterUrl),
    "chapterUrls",
  );
});

Deno.test(`${testSet.domain} chapter`, () => {
  if (testSet.data.randomChapterContent) {
    novel.chapters.forEach((chapter) => {
      assert(
        chapter.content.includes(testSet.data.randomChapterContent),
        "random content",
      );
    });
  }
  novel.chapters
    .slice(0, 1)
    .forEach((chapter, index) =>
      assert(
        chapter.title === testSet.data.chapterTitles[index],
        "first couple chapter titles",
      )
    );
});
