import { type PageKey, pagePaths } from "../i18n/routes.ts";
import { type Lang, SITE_URL } from "../lib/post-path.ts";
import { getAllPosts, translationOf } from "../lib/posts.ts";

const PAGES_IN_SITEMAP: PageKey[] = ["home", "about", "services", "contact", "tags", "imprint", "privacy", "thankYou"];

interface SitemapUrl {
  path: string;
  lastmod?: Date;
  alternates: Partial<Record<Lang, string>>;
}

function toXml({ path, lastmod, alternates }: SitemapUrl): string {
  const links = Object.entries(alternates).map(
    ([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${SITE_URL}${href}" />`,
  );
  return [
    "<url>",
    `<loc>${SITE_URL}${path}</loc>`,
    lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : "",
    ...(links.length > 1 ? links : []),
    "</url>",
  ].join("");
}

export async function GET() {
  const posts = await getAllPosts();
  const postUrls: SitemapUrl[] = posts.map((post) => {
    const translation = translationOf(post, posts);
    return {
      path: post.path,
      lastmod: post.updated,
      alternates: translation ? { [post.lang]: post.path, [translation.lang]: translation.path } : {},
    };
  });

  const pageUrls: SitemapUrl[] = PAGES_IN_SITEMAP.flatMap((page) => {
    const paths = pagePaths[page];
    const distinct = [...new Set(Object.values(paths))];
    return distinct.map((path) => ({ path, alternates: distinct.length > 1 ? paths : {} }));
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...[...postUrls, ...pageUrls].map(toXml),
    "</urlset>",
  ].join("\n");

  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
