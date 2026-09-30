import { type CollectionEntry, getCollection } from "astro:content";
import { isPublished, type Lang, parsePostFilename, postPath, SITE_URL, todayInBerlin } from "./post-path.ts";

const WORDS_PER_MINUTE = 200;

export type PostEntry = CollectionEntry<"posts"> | CollectionEntry<"drafts">;

export interface Post {
  entry: PostEntry;
  lang: Lang;
  translationKey: string;
  date: string;
  path: string;
  url: string;
  title: string;
  excerpt: string;
  published: Date;
  updated: Date;
  tags: string[];
  teaser?: string;
  readMinutes: number;
  isDraft: boolean;
}

function toPost(entry: PostEntry, isDraft: boolean, today: string): Post {
  const [lang, name] = entry.id.split("/") as [Lang, string];
  const { date, slug } = isDraft ? { date: today, slug: name } : parsePostFilename(`${name}.md`);
  const path = postPath(lang, date, entry.data.slug ?? slug);
  const published = entry.data.date ?? new Date(`${date}T12:00:00+01:00`);
  const words = (entry.body ?? "").split(/\s+/).filter(Boolean).length;
  return {
    entry,
    lang,
    translationKey: slug,
    date,
    path,
    url: `${SITE_URL}${path}`,
    title: entry.data.title,
    excerpt: entry.data.excerpt ?? "",
    published,
    updated: entry.data.updated ?? published,
    tags: entry.data.tags,
    teaser: entry.data.teaser,
    readMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    isDraft,
  };
}

export async function getAllPosts(): Promise<Post[]> {
  const today = todayInBerlin();
  const posts = (await getCollection("posts"))
    .map((entry) => toPost(entry, false, today))
    .filter((post) => isPublished(post.date, today));
  const drafts = import.meta.env.DEV ? (await getCollection("drafts")).map((entry) => toPost(entry, true, today)) : [];
  return [...posts, ...drafts].sort(
    (a, b) => b.date.localeCompare(a.date) || b.published.getTime() - a.published.getTime(),
  );
}

export async function getPosts(lang: Lang): Promise<Post[]> {
  return (await getAllPosts()).filter((post) => post.lang === lang);
}

export function translationOf(post: Post, posts: Post[]): Post | undefined {
  return posts.find((other) => other.lang !== post.lang && other.translationKey === post.translationKey);
}

export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function relatedPosts(post: Post, posts: Post[], limit = 3): Post[] {
  return posts
    .filter((other) => other !== post && other.lang === post.lang)
    .map((other) => ({ other, shared: other.tags.filter((tag) => post.tags.includes(tag)).length }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared || b.other.date.localeCompare(a.other.date))
    .slice(0, limit)
    .map(({ other }) => other);
}

export function postStaticPaths(posts: Post[], lang: Lang) {
  return posts
    .filter((post) => post.lang === lang)
    .map((post) => {
      const [year, month, day, slug] = post.path.replace(/^\/de/, "").split("/").filter(Boolean);
      return { params: { year, month, day, slug }, props: { post, posts } };
    });
}
