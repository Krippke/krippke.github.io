import assert from "node:assert/strict";
import { test } from "node:test";
import { readDist } from "../dist.mjs";

for (const page of ["/de/impressum", "/de/datenschutz"]) {
  test(`${page} has no open TODO placeholders`, () => {
    assert.doesNotMatch(readDist(page), /TODO/);
  });
}
