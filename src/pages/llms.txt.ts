import { pathOf } from "../i18n/routes.ts";
import { SITE_URL } from "../lib/post-path.ts";
import { getPosts, type Post } from "../lib/posts.ts";

const postLine = (post: Post) => `- [${post.title}](${post.url})${post.excerpt ? `: ${post.excerpt}` : ""}`;

export async function GET() {
  const englishPosts = await getPosts("en");
  const germanPosts = await getPosts("de");
  const text = [
    "# Manuel Holzrichter",
    "",
    "> Personal blog of Manuel Holzrichter, who has been building software for over 15 years. Covers pragmatic software engineering: software architecture, automated testing, developer effectiveness, and working with AI.",
    "",
    `The site is a static site at ${SITE_URL}, written in English with selected pages and posts in German. All posts are written by Manuel Holzrichter. Full-content Atom feeds are available at ${SITE_URL}${pathOf("feed", "en")} and ${SITE_URL}${pathOf("feed", "de")}.`,
    "",
    "## Posts",
    "",
    ...englishPosts.map(postLine),
    ...(germanPosts.length > 0 ? ["", "## Posts in German", "", ...germanPosts.map(postLine)] : []),
    "",
    "## Pages",
    "",
    `- [About](${SITE_URL}${pathOf("about", "en")}): Who Manuel Holzrichter is and what this blog covers.`,
    `- [Services](${SITE_URL}${pathOf("services", "en")}): Asynchronous codebase reviews, pull request reviews, design reviews and written second opinions by Manuel Holzrichter.`,
    `- [Contact](${SITE_URL}${pathOf("contact", "en")}): How to get in touch.`,
    "",
  ].join("\n");

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
