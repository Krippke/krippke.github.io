import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { SeriesLinkResolver } from "./series-link.ts";
import { isPublished, type Lang, parsePostFilename, postPath, SITE_URL, todayInBerlin } from "./post-path.ts";

const POSTS_DIR = fileURLToPath(new URL("../content/posts/", import.meta.url));
const SLUG_FRONT_MATTER = /^---\n[\s\S]*?^slug:\s*"?([^"\n]+)"?\s*$/m;

export function publishedPostUrls(lang: Lang, today: string = todayInBerlin()): Map<string, string> {
  const dir = `${POSTS_DIR}${lang}`;
  if (!existsSync(dir)) return new Map();
  const urls = new Map<string, string>();
  for (const filename of readdirSync(dir).filter((name) => name.endsWith(".md"))) {
    const { date, slug } = parsePostFilename(filename);
    if (!isPublished(date, today)) continue;
    const urlSlug = SLUG_FRONT_MATTER.exec(readFileSync(`${dir}/${filename}`, "utf8"))?.[1] ?? slug;
    urls.set(slug, `${SITE_URL}${postPath(lang, date, urlSlug)}`);
  }
  return urls;
}

export function seriesLinkResolver(): SeriesLinkResolver {
  const urls = { en: publishedPostUrls("en"), de: publishedPostUrls("de") };
  return (slug, file) => {
    const lang: Lang = /\/(posts|drafts)\/de\//.test(file.path ?? "") ? "de" : "en";
    return urls[lang].get(slug) ?? urls.en.get(slug);
  };
}
