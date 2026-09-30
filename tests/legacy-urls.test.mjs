import assert from "node:assert/strict";
import { test } from "node:test";
import { isServed, readDist, readFixture } from "./dist.mjs";

const SITE = "https://www.manuel-holzrichter.de";
const legacyUrls = readFixture("legacy-urls.txt");
const legacyPages = legacyUrls.filter((url) => !/\.[a-z0-9]+$/i.test(url));

for (const url of legacyUrls) {
  test(`legacy URL ${url} is still served`, () => {
    assert.ok(isServed(url), `${url} is missing in dist/`);
  });
}

test("sitemap lists every legacy page", () => {
  const sitemap = readDist("/sitemap.xml");
  for (const url of legacyPages) {
    assert.ok(sitemap.includes(`<loc>${SITE}${url}</loc>`), `${url} is missing in the sitemap`);
  }
});

test("llms.txt lists every legacy post", () => {
  const llms = readDist("/llms.txt");
  for (const url of legacyPages.filter((url) => /^\/\d{4}\//.test(url))) {
    assert.ok(llms.includes(`(${SITE}${url})`), `${url} is missing in llms.txt`);
  }
});

for (const url of ["/about/", "/contact/", "/thank-you/"]) {
  test(`${url} keeps returning 404 like the Jekyll site`, () => {
    assert.ok(!isServed(url), `${url} must not exist`);
  });
}
