import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const DIST = new URL("../dist/", import.meta.url).pathname;

export function distFileFor(urlPath) {
  if (urlPath.endsWith("/")) return join(DIST, urlPath, "index.html");
  if (/\.[a-z0-9]+$/i.test(urlPath)) return join(DIST, urlPath);
  return join(DIST, `${urlPath}.html`);
}

export function isServed(urlPath) {
  return existsSync(distFileFor(urlPath));
}

export function readDist(urlPath) {
  return readFileSync(distFileFor(urlPath), "utf8");
}

export function readFixture(name) {
  return readFileSync(new URL(`fixtures/${name}`, import.meta.url), "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
