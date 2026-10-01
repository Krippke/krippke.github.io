import type { Lang } from "../lib/post-path.ts";

export const CONTACT_EMAIL = "kontakt@manuel-holzrichter.de";

export const pagePaths = {
  home: { en: "/", de: "/de/" },
  about: { en: "/about", de: "/de/ueber-mich" },
  services: { en: "/services", de: "/de/leistungen" },
  contact: { en: "/contact", de: "/de/kontakt" },
  tags: { en: "/tags/", de: "/de/tags/" },
  imprint: { en: "/de/impressum", de: "/de/impressum" },
  privacy: { en: "/de/datenschutz", de: "/de/datenschutz" },
  thankYou: { en: "/thank-you", de: "/thank-you" },
  feed: { en: "/feed.xml", de: "/de/feed.xml" },
} as const satisfies Record<string, Record<Lang, string>>;

export type PageKey = keyof typeof pagePaths;

export function pathOf(page: PageKey, lang: Lang): string {
  return pagePaths[page][lang];
}

export function otherLang(lang: Lang): Lang {
  return lang === "en" ? "de" : "en";
}
