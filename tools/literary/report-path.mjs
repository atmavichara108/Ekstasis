#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
function value(name) {
  const i = args.indexOf(name);
  return i === -1 ? '' : (args[i + 1] ?? '');
}
const kind = value('--kind');
const selector = value('--selector');
const date = value('--date') || new Date().toLocaleDateString('sv-SE');

if (!kind || !selector) {
  console.error('Ошибка: обязательны непустые --kind и --selector.');
  process.exit(1);
}
if (kind === 'map') {
  console.error('Карта не файлуется по дате: картограф пишет в фиксированные регистры Картотека/Вселенная/.');
  process.exit(2);
}
const rituals = { reading: 'чтение', critique: 'критика' };
if (!rituals[kind]) {
  console.error(`Ошибка: неизвестный kind «${kind}»; допустимы reading, critique, map.`);
  process.exit(1);
}
const part = path.basename(selector).replace(/\.[^.]+$/, '')
  .replace(/[\\/\0]/g, '-')
  .trim();
if (!part) {
  console.error('Ошибка: selector не содержит имени части.');
  process.exit(1);
}
const base = `Отзывы/${date} — ${rituals[kind]} — ${part}.md`;
let result = base;
let n = 2;
while (fs.existsSync(path.resolve(result))) {
  result = `Отзывы/${date} — ${rituals[kind]} — ${part} (${n++}).md`;
}
process.stdout.write(`${result}\n`);
