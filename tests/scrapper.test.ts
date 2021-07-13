import { assert, assertEquals } from './packages.ts';
import ReadLightNovel from '../scrappers/ReadLightNovel.ts';

const testSet = JSON.parse(
  Deno.readTextFileSync(
    `${new URL('.', import.meta.url).pathname}readlightnovel.testset.json`,
  ),
);
const url = testSet.url;
const rln = new ReadLightNovel(url);
const novel = await rln.getNovel({ init: 0, end: 10 });

Deno.test('metadata', () => {
  assertEquals(novel.metadata.title, testSet.title, 'title');
  assertEquals(novel.metadata.author, testSet.author, 'author');
  assertEquals(novel.metadata.coverUrl, testSet.coverUrl, 'coverUrl');
  assert(
    novel.metadata.chapterUrls.includes(testSet.randomChapterUrl),
    'chapterUrls',
  );
});

Deno.test('chapter', () => {
  novel.chapters.forEach((chapter) => {
    assert(chapter.content.includes(testSet.randomChapterContent));
  });
  novel.chapters
    .slice(0, 1)
    .forEach((chapter, index) =>
      assert(chapter.title, testSet.chapterTitles[index]),
    );
});
