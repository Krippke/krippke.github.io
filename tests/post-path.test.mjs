import assert from "node:assert/strict";
import { test } from "node:test";
import { isPublished, parsePostFilename, postPath, todayInBerlin } from "../src/lib/post-path.ts";

test("date and slug come from the filename", () => {
  assert.deepEqual(parsePostFilename("2026-09-30-the-hidden-cost-of-unmaintainable-code.md"), {
    date: "2026-09-30",
    slug: "the-hidden-cost-of-unmaintainable-code",
  });
});

test("English posts live at the root like the Jekyll permalinks", () => {
  assert.equal(postPath("en", "2024-01-11", "the-role-of-tests"), "/2024/01/11/the-role-of-tests/");
});

test("German posts live under /de/", () => {
  assert.equal(postPath("de", "2024-01-11", "die-rolle-von-tests"), "/de/2024/01/11/die-rolle-von-tests/");
});

test("a post is published from its filename date on", () => {
  assert.equal(isPublished("2026-10-07", "2026-10-06"), false);
  assert.equal(isPublished("2026-10-07", "2026-10-07"), true);
  assert.equal(isPublished("2026-10-07", "2026-10-08"), true);
});

test("today is determined in Berlin time", () => {
  assert.equal(todayInBerlin(new Date("2026-10-06T22:30:00Z")), "2026-10-07");
  assert.equal(todayInBerlin(new Date("2026-10-06T21:30:00Z")), "2026-10-06");
});
