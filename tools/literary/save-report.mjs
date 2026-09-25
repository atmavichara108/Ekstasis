#!/usr/bin/env node
// Запись отчёта субагента в файл. Без LLM: текст отчёта приходит через stdin.
// node tools/literary/save-report.mjs --kind reading --selector "<часть>" [--date YYYY-MM-DD] < отчёт.md
import { writeFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { basename, dirname } from "node:path";
import { execFileSync } from "node:child_process";

const a = process.argv.slice(2);
const val = (n) => { const i = a.indexOf(n); return i < 0 ? null : a[i + 1]; };
const kind = val("--kind"), selector = val("--selector"), date = val("--date");

if (!kind || !selector) {
  console.error("нужно: --kind <reading|critique> --selector <часть>; текст отчёта подаётся в stdin");
  process.exit(1);
}

let text = "";
try { text = readFileSync(0, "utf8"); } catch { text = ""; }
if (!text.trim()) { console.error("stdin пуст: отчёт не передан, запись отменена"); process.exit(1); }

const args = ["tools/literary/report-path.mjs", "--kind", kind, "--selector", selector];
if (date) args.push("--date", date);
const rel = execFileSync("node", args, { encoding: "utf8" }).trim();

const bytes = Buffer.byteLength(basename(rel));
if (bytes > 255) { console.error(`имя файла ${bytes} байт > 255 (лимит ФС)`); process.exit(3); }
if (existsSync(rel)) { console.error(`файл уже существует, запись отменена: ${rel}`); process.exit(4); }

mkdirSync(dirname(rel), { recursive: true });
writeFileSync(rel, text.endsWith("\n") ? text : text + "\n", "utf8");
console.log(rel);
