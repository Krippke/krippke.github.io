import assert from "node:assert/strict";
import { test } from "node:test";
import { readDist, readFixture } from "./dist.mjs";

const SITE = "https://www.manuel-holzrichter.de";

function entries(feedXml) {
  return [...feedXml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, entry]) => ({
    id: entry.match(/<id>([^<]+)<\/id>/)[1],
    link: entry.match(/<link href="([^"]+)" rel="alternate"/)[1],
    content: entry.match(/<content type="html"[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/content>/)?.[1] ?? "",
  }));
}

const feed = readDist("/feed.xml");
const feedEntries = entries(feed);

test("feed is an Atom feed identified by its own URL", () => {
  assert.match(feed, /<feed xmlns="http:\/\/www.w3.org\/2005\/Atom"/);
  assert.match(feed, new RegExp(`<id>${SITE}/feed.xml</id>`));
});

test("feed contains the ten newest posts", () => {
  assert.equal(feedEntries.length, 10);
});

test("entry id is the post URL without trailing slash", () => {
  for (const { id, link } of feedEntries) {
    assert.equal(id, link.replace(/\/$/, ""));
  }
});

test("legacy entries keep their ids and order so readers do not see them as new", () => {
  const legacyIds = readFixture("legacy-feed-ids.txt");
  const legacyIdsStillInFeed = feedEntries.map(({ id }) => id).filter((id) => legacyIds.includes(id));
  assert.ok(legacyIdsStillInFeed.length > 0);
  assert.deepEqual(legacyIdsStillInFeed, legacyIds.slice(0, legacyIdsStillInFeed.length));
});

test("entries carry the full post content", () => {
  for (const { id, content } of feedEntries) {
    assert.ok(content.includes("<p>"), `${id} has no HTML content`);
  }
});

test("German feed only lists German posts", () => {
  const germanEntries = entries(readDist("/de/feed.xml"));
  for (const { link } of germanEntries) {
    assert.ok(link.startsWith(`${SITE}/de/`), link);
  }
});
