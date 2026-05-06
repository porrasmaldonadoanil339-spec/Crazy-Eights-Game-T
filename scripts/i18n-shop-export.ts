#!/usr/bin/env tsx
/**
 * Export per-language shop translation review CSVs.
 *
 * Reads ITEM_TL from `lib/storeItems.ts` and writes one CSV per language to
 * `i18n/shop-review/<lang>.csv`. Reviewers edit the `name`/`description`
 * columns and set `reviewed` to `yes`. The companion `i18n-shop-import.ts`
 * script merges the reviewed CSVs back into `lib/storeItems.ts`.
 *
 * Usage:
 *   npx tsx scripts/i18n-shop-export.ts                # all 19 non-curated langs
 *   npx tsx scripts/i18n-shop-export.ts fr de it       # specific languages
 *   npx tsx scripts/i18n-shop-export.ts --all          # include es/en/pt too
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ITEM_TL } from "../lib/storeItems";
import type { Lang } from "../lib/i18n";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = join(ROOT, "i18n", "shop-review");

const ALL_LANGS: Lang[] = [
  "es", "en", "pt", "fr", "de", "it", "tr", "ru", "pl", "nl", "sv",
  "da", "fi", "no", "zh", "ja", "ko", "hi", "th", "vi", "id", "ar",
];
const CURATED: Lang[] = ["es", "en", "pt"];
const REVIEW_LANGS: Lang[] = ALL_LANGS.filter(l => !CURATED.includes(l));

function csvEscape(v: string): string {
  if (v == null) return "";
  const needsQuote = /[",\r\n]/.test(v);
  const escaped = v.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
}

function toRow(values: string[]): string {
  return values.map(csvEscape).join(",");
}

function exportLang(lang: Lang): { path: string; rows: number; missing: number } {
  const header = ["id", "source_es", "source_en", "name", "description", "reviewed"];
  const lines: string[] = [toRow(header)];
  let missing = 0;
  for (const [id, tl] of Object.entries(ITEM_TL)) {
    const es = tl.es;
    const en = tl.en;
    const cur = tl[lang];
    if (!cur) missing++;
    lines.push(toRow([
      id,
      es?.name ? `${es.name} — ${es.description ?? ""}` : "",
      en?.name ? `${en.name} — ${en.description ?? ""}` : "",
      cur?.name ?? "",
      cur?.description ?? "",
      "no",
    ]));
  }
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const path = join(OUT_DIR, `${lang}.csv`);
  // Prepend UTF-8 BOM so Excel opens non-Latin scripts correctly.
  writeFileSync(path, "\uFEFF" + lines.join("\n") + "\n", "utf8");
  return { path, rows: lines.length - 1, missing };
}

function main() {
  const args = process.argv.slice(2);
  let langs: Lang[];
  if (args.includes("--all")) {
    langs = ALL_LANGS;
  } else if (args.length === 0) {
    langs = REVIEW_LANGS;
  } else {
    const requested = args.filter(a => !a.startsWith("--")) as Lang[];
    const bad = requested.filter(l => !ALL_LANGS.includes(l));
    if (bad.length) {
      console.error(`Unknown language code(s): ${bad.join(", ")}`);
      console.error(`Valid: ${ALL_LANGS.join(", ")}`);
      process.exit(2);
    }
    langs = requested;
  }
  console.log(`Exporting ${langs.length} language(s) to ${OUT_DIR}`);
  for (const lang of langs) {
    const { path, rows, missing } = exportLang(lang);
    console.log(`  ${lang}: ${rows} rows (${missing} missing) -> ${path}`);
  }
}

main();
