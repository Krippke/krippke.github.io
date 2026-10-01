import { pathOf } from "../i18n/routes.ts";
import { ui } from "../i18n/ui.ts";
import { type Lang, SITE_URL } from "./post-path.ts";
import { getPosts } from "./posts.ts";

const FEED_SIZE = 10;
const AUTHOR = "<author><name>Manuel Holzrichter</name></author>";

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const cdata = (value: string) => `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;

export async function atomFeed(lang: Lang): Promise<Response> {
  const posts = (await getPosts(lang)).slice(0, FEED_SIZE);
  const feedUrl = `${SITE_URL}${pathOf("feed", lang)}`;
  const updated = posts.reduce((latest, post) => Math.max(latest, post.updated.getTime()), 0);
  const entries = posts.map((post) => {
    const title = escapeXml(post.title);
    return [
      "<entry>",
      `<title type="html">${title}</title>`,
      `<link href="${post.url}" rel="alternate" type="text/html" title="${title}" />`,
      `<published>${post.published.toISOString()}</published>`,
      `<updated>${post.updated.toISOString()}</updated>`,
      `<id>${post.url.replace(/\/$/, "")}</id>`,
      `<content type="html" xml:base="${post.url}">${cdata(post.entry.rendered?.html ?? "")}</content>`,
      AUTHOR,
      ...post.tags.map((tag) => `<category term="${escapeXml(tag)}" />`),
      post.excerpt ? `<summary type="html">${cdata(post.excerpt)}</summary>` : "",
      "</entry>",
    ].join("");
  });

  const xml = [
    '<?xml version="1.0" encoding="utf-8"?>',
    `<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${lang}">`,
    `<link href="${feedUrl}" rel="self" type="application/atom+xml" />`,
    `<link href="${SITE_URL}${pathOf("home", lang)}" rel="alternate" type="text/html" />`,
    `<updated>${new Date(updated || Date.now()).toISOString()}</updated>`,
    `<id>${feedUrl}</id>`,
    '<title type="html">Manuel Holzrichter</title>',
    `<subtitle>${escapeXml(ui[lang].siteDescription)}</subtitle>`,
    AUTHOR,
    ...entries,
    "</feed>",
  ].join("");

  return new Response(xml, { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } });
}
