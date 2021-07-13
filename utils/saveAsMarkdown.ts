import { Chapter, Novel } from "../types/Novel.ts";

export default async function (
  novel: Novel,
  filename?: string,
): Promise<boolean> {
  let text = `---\nCJKmainfont: Noto Serif CJK TC\n---\n
![cover](${novel.metadata.coverUrl})\n
# ${novel.metadata.title}\n
### ${novel.metadata.author}\n\n`;

  novel.chapters.forEach((chapter: Chapter, index: number) => {
    text = text.concat(
      `## ${chapter.title}\n\n${chapter.content}\n\n`,
    );
  });

  try {
    Deno.writeTextFileSync(
      filename ? filename : `${novel.metadata.title}.md`,
      text,
    );
  } catch (e) {
    console.error(e.message);
    return false;
  }
  return true;
}
