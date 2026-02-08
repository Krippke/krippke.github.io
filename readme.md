# manuel-holzrichter.de

Personal blog at [www.manuel-holzrichter.de](https://www.manuel-holzrichter.de) — built with [Jekyll](https://jekyllrb.com/) and the [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/) theme, hosted on GitHub Pages.

## Local Development

```bash
docker compose up
```

The site is available at `http://localhost:4000`.

## Content

Posts go in `_posts/`, drafts in `_drafts/`. File naming: `YYYY-MM-DD-title.md`.

Front matter:

```yaml
---
layout: single
title: "The role of ..."
date: 2025-01-01 12:00:00 +0100
header:
  teaser: /assets/images/your-image.png
author: "Manuel Holzrichter"
tags: [software development]
---
```

Images go in `assets/images/`.

## Deployment

Push to `main` — GitHub Pages builds and deploys automatically.
