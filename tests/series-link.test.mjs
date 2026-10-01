import assert from "node:assert/strict";
import { test } from "node:test";
import rehypeStringify from "rehype-stringify";
import remarkDirective from "remark-directive";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { remarkSeriesLink } from "../src/lib/series-link.ts";

const publishedUrls = new Map([
  ["the-hidden-cost-of-unmaintainable-code", "https://www.manuel-holzrichter.de/2026/09/30/the-hidden-cost-of-unmaintainable-code/"],
]);

async function render(markdown) {
  const html = await unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkSeriesLink, { resolve: (slug) => publishedUrls.get(slug) })
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);
  return String(html);
}

test("a published target renders as an absolute link", async () => {
  const html = await render(
    'Start with :series-link[the overview]{slug="the-hidden-cost-of-unmaintainable-code" pending=" - coming soon"}.',
  );
  assert.equal(
    html,
    '<p>Start with <a href="https://www.manuel-holzrichter.de/2026/09/30/the-hidden-cost-of-unmaintainable-code/">the overview</a>.</p>',
  );
});

test("an unpublished target renders its text followed by the pending note", async () => {
  const html = await render('1. :series-link[One decision, one place]{slug="one-decision-one-place" pending=" - coming soon"}');
  assert.equal(html, "<ol>\n<li>One decision, one place - coming soon</li>\n</ol>");
});

test("an unpublished target without pending note renders its text only", async () => {
  const html = await render('Deep dive: :series-link[One decision, one place]{slug="one-decision-one-place"}');
  assert.equal(html, "<p>Deep dive: One decision, one place</p>");
});

test("the link text keeps inline formatting", async () => {
  const html = await render(':series-link[the *overview*]{slug="the-hidden-cost-of-unmaintainable-code"}');
  assert.match(html, /<a href="[^"]+">the <em>overview<\/em><\/a>/);
});
