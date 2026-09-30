import { unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import remarkDirective from "remark-directive";
import { SITE_URL } from "./src/lib/post-path.ts";
import { seriesLinkResolver } from "./src/lib/published-posts.ts";
import { remarkSeriesLink } from "./src/lib/series-link.ts";

export default defineConfig({
  site: SITE_URL,
  build: { format: "preserve" },
  trailingSlash: "ignore",
  compressHTML: true,
  devToolbar: { enabled: false },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkDirective, [remarkSeriesLink, { resolve: seriesLinkResolver() }]],
    }),
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
    },
  },
});
