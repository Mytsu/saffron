import { assert, assertStringIncludes, exists, delay } from './packages.ts';
import type { Novel } from '../types/Novel.ts';
import saveAsMarkdown from '../utils/saveAsMarkdown.ts';

Deno.test('saveAsMarkdown', async () => {
  const novel = {
    metadata: {
      url: 'test-url',
      title: 'Testing novel',
      author: 'Yours Truly',
      coverUrl: 'test-coverUrl',
      chapterUrls: ['test-chapterUrl1', 'test-chapterUrl2'],
    },
    chapters: [
      { title: 'TestChapter 1', content: 'TestContent' },
      { title: 'TestChapter 2', content: 'TestContent' },
    ],
  } as Novel;
  saveAsMarkdown(novel);
  const filename = novel.metadata.title + '.md';
  assert(exists(filename), 'Filename exists');
  const file = Deno.readTextFileSync(filename);
  assertStringIncludes(
    file,
    novel.metadata.title,
    'Novel Title included in file',
  );
  assertStringIncludes(file, novel.metadata.author, 'Author included in file');
  assertStringIncludes(
    file,
    novel.metadata.coverUrl,
    'Cover url included in file',
  );
  novel.chapters.forEach((chapter, index) => {
    assertStringIncludes(
      file,
      chapter.title,
      `Chapter ${index} title included in file`,
    );
    assertStringIncludes(
      file,
      chapter.content,
      `Chapter ${index} content included in file`,
    );
  });
  /*
    Can't run a sub-process to delete the file without Deno emitting an Error for unhandled leak of resources.
    So there's a need to wait for the sub-process to run before the test is finished.
  */
  const sub = Deno.run({ cmd: ["rm", "Testing novel.md"] });
  await delay(1000);
  sub.close();
});
