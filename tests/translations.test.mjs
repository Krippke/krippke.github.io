import assert from "node:assert/strict";
import { test } from "node:test";
import { readDist } from "./dist.mjs";
import { publishedPostUrls } from "../src/lib/published-posts.ts";

const SITE = "https://www.manuel-holzrichter.de";
const englishUrls = publishedPostUrls("en");
const germanUrls = publishedPostUrls("de");
const pathOf = (url) => url.slice(SITE.length);

for (const [slug, englishUrl] of englishUrls) {
  test(`${slug} has a German translation`, () => {
    assert.ok(germanUrls.has(slug), `${slug} is missing in src/content/posts/de`);
    assert.match(pathOf(germanUrls.get(slug)), /^\/de\/\d{4}\/\d{2}\/\d{2}\/[a-z0-9-]+\/$/);
  });

  test(`${slug} and its translation link to each other`, () => {
    const germanUrl = germanUrls.get(slug);
    assert.ok(readDist(pathOf(englishUrl)).includes(`<link rel="alternate" hreflang="de" href="${germanUrl}">`));
    assert.ok(readDist(pathOf(germanUrl)).includes(`<link rel="alternate" hreflang="en" href="${englishUrl}">`));
  });
}

test("the German home page only lists English posts without a translation", () => {
  const germanHome = readDist("/de/");
  for (const [slug, englishUrl] of englishUrls) {
    const listed = germanHome.includes(`href="${pathOf(englishUrl)}"`);
    assert.equal(listed, !germanUrls.has(slug), `${slug} listed: ${listed}`);
  }
});
