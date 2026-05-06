#!/usr/bin/env tsx
/**
 * Shop translation coverage & staleness checker.
 *
 * Reads ITEM_TL from `lib/storeItems.ts` and prints a per-language coverage
 * report (total ids, missing ids, % covered) plus a count of "stale" entries
 * — translations whose Spanish source has changed since the row was last
 * reviewed (according to `i18n/shop-review/.review-state.json`).
 *
 * Usage:
 *   npx tsx scripts/i18n-shop-check.ts                # all 22 langs
 *   npx tsx scripts/i18n-shop-check.ts fr de it       # specific languages
 *   npx tsx scripts/i18n-shop-check.ts --verbose      # also list ids
 *   npx tsx scripts/i18n-shop-check.ts --json         # machine-readable
 *
 * Exits non-zero if any non-curated language has missing or stale rows
 * (useful as a pre-release gate). Pass `--no-fail` to always exit 0.
 */
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ITEM_TL } from "../lib/storeItems";
import type { Lang } from "../lib/i18n";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const REVIEW_DIR = join(ROOT, "i18n", "shop-review");
const STATE_FILE = join(REVIEW_DIR, ".review-state.json");

const ALL_LANGS: Lang[] = [
  "es", "en", "pt", "fr", "de", "it", "tr", "ru", "pl", "nl", "sv",
  "da", "fi", "no", "zh", "ja", "ko", "hi", "th", "vi", "id", "ar",
];
const CURATED: Lang[] = ["es", "en", "pt"];

export function sourceEsHash(name: string, description: string): string {
  return createHash("sha1")
    .update(`${name}\u0000${description}`)
    .digest("hex")
    .slice(0, 12);
}

type ReviewState = {
  // For each id, a per-lang record of the source_es hash that was current
  // when that (id, lang) row was last imported via the review pipeline.
  ids: Record<string, Partial<Record<Lang, string>>>;
};

export function loadReviewState(): ReviewState {
  if (!existsSync(STATE_FILE)) return { ids: {} };
  try {
    const raw = JSON.parse(readFileSync(STATE_FILE, "utf8"));
    if (raw && typeof raw === "object" && raw.ids) return raw as ReviewState;
  } catch {
    // fall through
  }
  return { ids: {} };
}

type LangReport = {
  lang: Lang;
  total: number;
  present: number;
  missing: number;
  stale: number;
  missingIds: string[];
  staleIds: string[];
};

export function buildReport(lang: Lang, state: ReviewState): LangReport {
  const missingIds: string[] = [];
  const staleIds: string[] = [];
  let present = 0;
  let total = 0;
  for (const [id, tl] of Object.entries(ITEM_TL)) {
    total++;
    const cur = tl[lang];
    if (!cur || (!cur.name && !cur.description)) {
      missingIds.push(id);
      continue;
    }
    present++;
    const es = tl.es;
    if (!es) continue;
    const recorded = state.ids[id]?.[lang];
    if (recorded == null) continue; // never reviewed -> not "stale", just unverified
    const current = sourceEsHash(es.name ?? "", es.description ?? "");
    if (recorded !== current) staleIds.push(id);
  }
  return {
    lang,
    total,
    present,
    missing: missingIds.length,
    stale: staleIds.length,
    missingIds,
    staleIds,
  };
}

function pct(n: number, d: number): string {
  if (d === 0) return "0.0%";
  return `${((n / d) * 100).toFixed(1)}%`;
}

function main() {
  const argv = process.argv.slice(2);
  const verbose = argv.includes("--verbose");
  const asJson = argv.includes("--json");
  const noFail = argv.includes("--no-fail");
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
    langs = ALL_LANGS;
  }

  const state = loadReviewState();
  const reports = langs.map(l => buildReport(l, state));

  if (asJson) {
    console.log(JSON.stringify({
      generatedAt: new Date().toISOString(),
      stateFile: STATE_FILE,
      reports,
    }, null, 2));
  } else {
    const colW = { lang: 4, total: 5, present: 7, missing: 7, stale: 5, cov: 8 };
    const header = [
      "lang".padEnd(colW.lang),
      "total".padStart(colW.total),
      "present".padStart(colW.present),
      "missing".padStart(colW.missing),
      "stale".padStart(colW.stale),
      "coverage".padStart(colW.cov),
      "  curated?",
    ].join("  ");
    console.log(header);
    console.log("-".repeat(header.length));
    for (const r of reports) {
      console.log([
        r.lang.padEnd(colW.lang),
        String(r.total).padStart(colW.total),
        String(r.present).padStart(colW.present),
        String(r.missing).padStart(colW.missing),
        String(r.stale).padStart(colW.stale),
        pct(r.present, r.total).padStart(colW.cov),
        CURATED.includes(r.lang) ? "  yes" : "  no",
      ].join("  "));
      if (verbose) {
        if (r.missingIds.length) console.log(`    missing: ${r.missingIds.join(", ")}`);
        if (r.staleIds.length) console.log(`    stale:   ${r.staleIds.join(", ")}`);
      }
    }
    if (!existsSync(STATE_FILE)) {
      console.log("");
      console.log(`(no review-state file at ${STATE_FILE} — stale tracking inactive until you re-run \`scripts/i18n-shop-import.ts\`.)`);
    }
  }

  if (noFail) return;
  const offenders = reports.filter(r => !CURATED.includes(r.lang) && (r.missing > 0 || r.stale > 0));
  if (offenders.length > 0) {
    if (!asJson) {
      console.log("");
      console.log(`FAIL: ${offenders.length} non-curated language(s) need attention: ${offenders.map(o => o.lang).join(", ")}`);
      console.log(`(Run with --no-fail to suppress this exit code.)`);
    }
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
