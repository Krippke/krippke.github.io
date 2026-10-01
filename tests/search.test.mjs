import assert from "node:assert/strict";
import { test } from "node:test";
import { isServed, readDist } from "./dist.mjs";
import { publishedPostUrls } from "../src/lib/published-posts.ts";

test("the search UI the dialog loads is part of the build", () => {
  assert.ok(isServed("/pagefind/pagefind-ui.js"));
  assert.ok(isServed("/pagefind/pagefind-ui.css"));
});

for (const lang of ["en", "de"]) {
  test(`the ${lang} search index covers exactly the published ${lang} posts`, () => {
    const { languages } = JSON.parse(readDist("/pagefind/pagefind-entry.json"));
    assert.equal(languages[lang]?.page_count, publishedPostUrls(lang).size, JSON.stringify(languages));
  });
}
