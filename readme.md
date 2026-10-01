# manuel-holzrichter.de

Personal blog at [www.manuel-holzrichter.de](https://www.manuel-holzrichter.de), built with [Astro](https://astro.build) and deployed to GitHub Pages by GitHub Actions. English lives at the root, German under `/de/`.

## Local development

```bash
npm install
npm run dev       # http://localhost:4321, includes drafts and a search index of the last build
npm run build     # static site in dist/, plus search index
npm test          # URL, feed and series-link contract
```

Search is built by Pagefind from the finished site, with one index per page language. Because of that, `npm run dev` builds once before it starts and the index does not pick up changes made while it runs.

## Content

- Posts: `src/content/posts/<lang>/YYYY-MM-DD-slug.md`. Date and slug in the filename define the URL (`/YYYY/MM/DD/slug/`, German posts under `/de/`).
- Drafts: `src/content/drafts/<lang>/slug.md`, visible only in `npm run dev`.
- A German translation uses the same filename as the English post. An optional `slug:` gives it a German URL.
- Images: `public/assets/images/`.

```yaml
---
title: "The role of ..."
excerpt: "One or two sentences for lists, feeds and search engines."
date: 2026-10-07 18:00:00 +0200
updated: 2026-10-07T18:00:00+02:00
teaser: /assets/images/your-image.jpg
tags: [software-architecture, testing]
---
```

Link to another post whose publication may still be pending with `:series-link[Link text]{slug="post-slug" pending=" - coming soon"}`. It becomes a link once the target is published.

## Publishing

A post appears on the date in its filename (Berlin time). The workflow builds on every push to `main` and every morning at 04:00 UTC, so a post can be pushed ahead of its date.

Deployment is blocked while the legal pages still contain `TODO` placeholders (`npm run test:release`).
