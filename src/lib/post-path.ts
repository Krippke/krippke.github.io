export type Lang = "en" | "de";

export const SITE_URL = "https://www.manuel-holzrichter.de";

const POST_FILENAME = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;

export function parsePostFilename(filename: string): { date: string; slug: string } {
  const match = POST_FILENAME.exec(filename);
  if (!match) throw new Error(`Post filename must look like YYYY-MM-DD-slug.md: ${filename}`);
  return { date: match[1], slug: match[2] };
}

export function postPath(lang: Lang, date: string, slug: string): string {
  const [year, month, day] = date.split("-");
  const prefix = lang === "en" ? "" : `/${lang}`;
  return `${prefix}/${year}/${month}/${day}/${slug}/`;
}

export function isPublished(date: string, today: string): boolean {
  return date <= today;
}

export function todayInBerlin(now: Date = buildClock()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(now);
}

function buildClock(): Date {
  const buildDate = process.env.BUILD_DATE;
  return buildDate ? new Date(`${buildDate}T12:00:00+02:00`) : new Date();
}
