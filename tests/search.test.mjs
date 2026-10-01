import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { test } from "node:test";
import { isServed, readDist } from "./dist.mjs";

const englishPostCount = readdirSync(new URL("../src/content/posts/en/", import.meta.url)).filter((name) => name.endsWith(".md")).length;

test("the search UI the dialog loads is part of the build", () => {
  assert.ok(isServed("/pagefind/pagefind-ui.js"));
  assert.ok(isServed("/pagefind/pagefind-ui.css"));
});

test("the search index covers the published posts", () => {
  const entry = JSON.parse(readDist("/pagefind/pagefind-entry.json"));
  const pageCount = Object.values(entry.languages).reduce((sum, { page_count }) => sum + page_count, 0);
  assert.ok(pageCount > 0 && pageCount <= englishPostCount, `index has ${pageCount} pages`);
});
