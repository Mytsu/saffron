import { Chapter, Novel } from "../types/Novel.ts";

function write(data: string, filename: string): boolean {
  try {
    Deno.writeTextFileSync(
      filename,
      data,
    );
    return true;
  } catch (e) {
    console.error(e.message);
    return false;
  }
}

export function saveAsMarkdown(novel: Novel, filename?: string): boolean {
  let text = `---\nCJKmainfont: Noto Serif CJK TC\n---\n
![cover](${novel.metadata.coverUrl})\n
# ${novel.metadata.title}\n
### ${novel.metadata.author}\n\n`;

  novel.chapters.forEach((chapter: Chapter) => {
    text = text.concat(`## ${chapter.title}\n\n${chapter.content}\n\n`);
  });

  return write(text, filename ? filename : `${novel.metadata.title}.md`);
}

export function saveAsJson(novel: Novel, filename?: string): boolean {
  return write(
    JSON.stringify(novel),
    filename ? filename : `${novel.metadata.title}.json`,
  );
}
