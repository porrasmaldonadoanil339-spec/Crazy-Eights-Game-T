#!/usr/bin/env tsx
/**
 * Import reviewed per-language shop translation CSVs back into
 * `lib/storeItems.ts` (the `ITEM_TL` block).
 *
 * For every CSV under `i18n/shop-review/<lang>.csv`, rows whose `reviewed`
 * column is truthy ("yes", "y", "true", "1", "✓") replace the matching
 * (id, lang) entry in ITEM_TL. Untouched / unreviewed rows are ignored,
 * preserving whatever currently lives in storeItems.ts.
 *
 * Then ITEM_TL is regenerated as TypeScript source between the
 * `// ITEM_TL_START` and `// ITEM_TL_END` markers in storeItems.ts.
 *
 * Usage:
 *   npx tsx scripts/i18n-shop-import.ts                    # all CSVs found
 *   npx tsx scripts/i18n-shop-import.ts fr de              # only specific langs
 *   npx tsx scripts/i18n-shop-import.ts --dry-run          # preview, no writes
 *   npx tsx scripts/i18n-shop-import.ts --force-unreviewed # also import rows
 *                                                          # not marked reviewed
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ITEM_TL, type ItemTL } from "../lib/storeItems";
import type { Lang } from "../lib/i18n";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const REVIEW_DIR = join(ROOT, "i18n", "shop-review");
const STORE_FILE = join(ROOT, "lib", "storeItems.ts");
const START_MARKER = "// ITEM_TL_START";
const END_MARKER = "// ITEM_TL_END";

const ALL_LANGS: Lang[] = [
  "es", "en", "pt", "fr", "de", "it", "tr", "ru", "pl", "nl", "sv",
  "da", "fi", "no", "zh", "ja", "ko", "hi", "th", "vi", "id", "ar",
];

// ---------- CSV parsing ----------
function parseCsv(text: string): string[][] {
  // Strip UTF-8 BOM
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\r") { /* skip */ }
      else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else cur += c;
    }
  }
  if (cur.length > 0 || row.length > 0) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.length > 1 || (r.length === 1 && r[0].length > 0));
}

const TRUTHY = new Set(["yes", "y", "true", "1", "✓", "x", "done"]);
function isReviewed(v: string): boolean {
  return TRUTHY.has((v ?? "").trim().toLowerCase());
}

// ---------- Apply CSV edits to a working copy of ITEM_TL ----------
type WorkingTL = Record<string, ItemTL>;

function loadCsvForLang(lang: Lang): { rows: { id: string; name: string; description: string; reviewed: boolean }[] } | null {
  const path = join(REVIEW_DIR, `${lang}.csv`);
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, "utf8");
  const grid = parseCsv(raw);
  if (grid.length === 0) return { rows: [] };
  const header = grid[0].map(h => h.trim().toLowerCase());
  const idIdx = header.indexOf("id");
  const nameIdx = header.indexOf("name");
  const descIdx = header.indexOf("description");
  const revIdx = header.indexOf("reviewed");
  if (idIdx < 0 || nameIdx < 0 || descIdx < 0) {
    throw new Error(`${path}: header must include id,name,description (got: ${header.join(",")})`);
  }
  const rows = grid.slice(1).map(r => ({
    id: (r[idIdx] ?? "").trim(),
    name: r[nameIdx] ?? "",
    description: r[descIdx] ?? "",
    reviewed: revIdx >= 0 ? isReviewed(r[revIdx] ?? "") : false,
  })).filter(r => r.id.length > 0);
  return { rows };
}

function applyCsvs(working: WorkingTL, langs: Lang[], forceUnreviewed: boolean) {
  let totalApplied = 0;
  let totalSkipped = 0;
  let totalUnknown = 0;
  for (const lang of langs) {
    const csv = loadCsvForLang(lang);
    if (!csv) { console.log(`  ${lang}: no CSV (skipping)`); continue; }
    let applied = 0, skipped = 0, unknown = 0;
    for (const row of csv.rows) {
      if (!row.reviewed && !forceUnreviewed) { skipped++; continue; }
      if (!working[row.id]) { unknown++; continue; }
      const name = row.name.trim();
      const description = row.description.trim();
      if (!name && !description) { skipped++; continue; }
      working[row.id] = {
        ...working[row.id],
        [lang]: {
          name: name || working[row.id][lang]?.name || "",
          description: description || working[row.id][lang]?.description || "",
        },
      };
      applied++;
    }
    console.log(`  ${lang}: applied=${applied} skipped=${skipped} unknown_id=${unknown} (of ${csv.rows.length} rows)`);
    totalApplied += applied; totalSkipped += skipped; totalUnknown += unknown;
  }
  console.log(`Total: applied=${totalApplied} skipped=${totalSkipped} unknown_id=${totalUnknown}`);
}

// ---------- Regenerate the ITEM_TL block ----------
function escapeStr(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t");
}

function renderBlock(working: WorkingTL): string {
  const lines: string[] = [];
  lines.push("export const ITEM_TL: Record<string, ItemTL> = {");
  for (const id of Object.keys(working)) {
    lines.push(`  ${id}: {`);
    const tl = working[id];
    for (const lang of ALL_LANGS) {
      const v = tl[lang];
      if (!v) continue;
      lines.push(`    ${lang}: { name: "${escapeStr(v.name)}", description: "${escapeStr(v.description)}" },`);
    }
    lines.push(`  },`);
  }
  lines.push("};");
  return lines.join("\n");
}

function rewriteStoreFile(blockSrc: string, dryRun: boolean) {
  const original = readFileSync(STORE_FILE, "utf8");
  const startIdx = original.indexOf(START_MARKER);
  const endIdx = original.indexOf(END_MARKER);
  if (startIdx < 0 || endIdx < 0) {
    throw new Error(`Markers not found in ${STORE_FILE}. Expected ${START_MARKER} and ${END_MARKER}.`);
  }
  // Preserve the START_MARKER line and the explanatory comment block
  // up to (but not including) the `export const ITEM_TL` line.
  const constIdx = original.indexOf("export const ITEM_TL", startIdx);
  if (constIdx < 0 || constIdx > endIdx) {
    throw new Error("Could not locate `export const ITEM_TL` between markers.");
  }
  const before = original.slice(0, constIdx);
  const after = original.slice(endIdx);
  const next = before + blockSrc + "\n" + after;

  if (dryRun) {
    console.log(`[dry-run] would rewrite ${STORE_FILE} (${next.length - original.length} byte delta)`);
    return;
  }
  writeFileSync(STORE_FILE, next, "utf8");
  console.log(`Wrote ${STORE_FILE} (${next.length - original.length} byte delta)`);
}

// ---------- Main ----------
function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const forceUnreviewed = argv.includes("--force-unreviewed");
  const requested = argv.filter(a => !a.startsWith("--")) as Lang[];

  let langs: Lang[];
  if (requested.length > 0) {
    const bad = requested.filter(l => !ALL_LANGS.includes(l));
    if (bad.length) {
      console.error(`Unknown language code(s): ${bad.join(", ")}`);
      process.exit(2);
    }
    langs = requested;
  } else {
    if (!existsSync(REVIEW_DIR)) {
      console.error(`Review directory not found: ${REVIEW_DIR}`);
      console.error(`Run \`npx tsx scripts/i18n-shop-export.ts\` first.`);
      process.exit(2);
    }
    langs = readdirSync(REVIEW_DIR)
      .filter(f => f.endsWith(".csv"))
      .map(f => f.slice(0, -4) as Lang)
      .filter(l => ALL_LANGS.includes(l));
  }

  console.log(`Importing ${langs.length} language CSV(s)${forceUnreviewed ? " [force-unreviewed]" : ""}${dryRun ? " [dry-run]" : ""}`);
  const working: WorkingTL = {};
  for (const id of Object.keys(ITEM_TL)) working[id] = { ...ITEM_TL[id] };

  applyCsvs(working, langs, forceUnreviewed);
  const block = renderBlock(working);
  rewriteStoreFile(block, dryRun);
}

main();
