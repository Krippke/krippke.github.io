import type { Lang } from "../lib/post-path.ts";

const en = {
  siteDescription:
    "Pragmatic software engineering — exploring architecture, clear responsibilities, and what makes developers truly effective. Insights from 15+ years of hands-on experience.",
  authorBio: "Curious about everything in tech.",
  locale: "en_US",
  languageName: "English",
  switchLanguage: "Deutsch",
  switchLanguageLabel: "Diese Seite auf Deutsch",
  nav: { blog: "Blog", services: "Services", about: "About", tags: "Tags", contact: "Contact" },
  skipToContent: "Skip to content",
  search: "Search",
  searchLabel: "Search the blog",
  closeSearch: "Close",
  toggleTheme: "Switch between light and dark mode",
  readTime: (minutes: number) => `${minutes} min read`,
  updated: "Updated",
  tags: "Tags",
  share: "Share",
  previousPost: "Previous post",
  nextPost: "Next post",
  related: "Related posts",
  writtenBy: "Written by",
  posts: "Posts",
  postsInOtherLanguage: "",
  feed: "Feed",
  imprint: "Imprint",
  privacy: "Privacy",
  draft: "Draft",
  tagIndexTitle: "Tags",
  tagIndexIntro: "Every topic I have written about, with the posts that cover it.",
  postCount: (count: number) => (count === 1 ? "1 post" : `${count} posts`),
  notFoundTitle: "Page not found",
  notFoundText: "This page does not exist, or it has moved. The blog has everything I have written.",
  notFoundLink: "Go to the blog",
};

type Ui = typeof en;

const de: Ui = {
  siteDescription:
    "Pragmatische Softwareentwicklung — Architektur, klare Verantwortlichkeiten und was Entwickler wirklich effektiv macht. Aus über 15 Jahren Praxis.",
  authorBio: "Neugierig auf alles, was Technik ausmacht.",
  locale: "de_DE",
  languageName: "Deutsch",
  switchLanguage: "English",
  switchLanguageLabel: "This page in English",
  nav: { blog: "Blog", services: "Leistungen", about: "Über mich", tags: "Themen", contact: "Kontakt" },
  skipToContent: "Zum Inhalt springen",
  search: "Suche",
  searchLabel: "Blog durchsuchen",
  closeSearch: "Schließen",
  toggleTheme: "Zwischen hellem und dunklem Modus wechseln",
  readTime: (minutes: number) => `${minutes} Min. Lesezeit`,
  updated: "Aktualisiert",
  tags: "Themen",
  share: "Teilen",
  previousPost: "Vorheriger Beitrag",
  nextPost: "Nächster Beitrag",
  related: "Ähnliche Beiträge",
  writtenBy: "Geschrieben von",
  posts: "Beiträge",
  postsInOtherLanguage: "Beiträge auf Englisch",
  feed: "Feed",
  imprint: "Impressum",
  privacy: "Datenschutz",
  draft: "Entwurf",
  tagIndexTitle: "Themen",
  tagIndexIntro: "Alle Themen der deutschen Beiträge.",
  postCount: (count: number) => (count === 1 ? "1 Beitrag" : `${count} Beiträge`),
  notFoundTitle: "Seite nicht gefunden",
  notFoundText: "Diese Seite gibt es nicht, oder sie ist umgezogen. Im Blog finden Sie alles, was ich geschrieben habe.",
  notFoundLink: "Zum Blog",
};

export const ui: Record<Lang, Ui> = { en, de };

export function formatDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(date);
}
