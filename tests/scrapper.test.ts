import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.100.0/testing/asserts.ts";
import { ReadLightNovel } from "../scrappers/ReadLightNovel.ts";

const testSet = {
  url: "https://www.readlightnovel.org/beastmaster-of-the-ages",
  title: "Beastmaster of the Ages",
  author: "齐成琨",
  coverUrl: "https://www.readlightnovel.org/uploads/posters/1603400986.jpg",
  randomChapterUrl:
    "https://www.readlightnovel.org/beastmaster-of-the-ages/chapter-413",
  randomChapterContent:
    "Please go to https://www.novelupdates.cc/Beastmaster-of-the-Ages/ to read the latest chapters for free",
};

const url = testSet.url;
const rln = new ReadLightNovel(url);
const novel = await rln.getNovel({ init: 0, end: 10 });

Deno.test("metadata", () => {
  assertEquals(novel.metadata.title, testSet.title, "title");
  assertEquals(novel.metadata.author, testSet.author, "author");
  assertEquals(novel.metadata.coverUrl, testSet.coverUrl, "coverUrl");
  assert(
    novel.metadata.chapterUrls.includes(testSet.randomChapterUrl),
    "chapterUrls",
  );
});

Deno.test("chapter", () => {
  novel.chapters.forEach((chapter) => {
    console.log(chapter.content);
    assert(chapter.content.includes(testSet.randomChapterContent));
  });
});
