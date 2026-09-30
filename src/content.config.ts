import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const JEKYLL_OFFSET = / ?([+-]\d{2})(\d{2})$/;

const timestamp = z
  .union([z.date(), z.string()])
  .transform((value) => (value instanceof Date ? value : new Date(value.replace(" ", "T").replace(JEKYLL_OFFSET, "$1:$2"))))
  .refine((date) => !Number.isNaN(date.getTime()), "invalid date");

const post = z.object({
  title: z.string(),
  excerpt: z.string().optional(),
  date: timestamp.optional(),
  updated: timestamp.optional(),
  teaser: z.string().optional(),
  tags: z.array(z.string()).default([]),
  slug: z.string().optional(),
});

const keepPathAsId = ({ entry }: { entry: string }) => entry.replace(/\.md$/, "");

export const collections = {
  posts: defineCollection({
    loader: glob({ pattern: "{en,de}/*.md", base: "./src/content/posts", generateId: keepPathAsId }),
    schema: post,
  }),
  drafts: defineCollection({
    loader: glob({ pattern: "{en,de}/*.md", base: "./src/content/drafts", generateId: keepPathAsId }),
    schema: post,
  }),
};
