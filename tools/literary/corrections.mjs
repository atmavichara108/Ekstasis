#!/usr/bin/env node
import fs from 'node:fs';

const [mode, file] = process.argv.slice(2);
if (!['checked', 'list'].includes(mode) || !file) {
  console.error('Использование: node tools/literary/corrections.mjs <checked|list> <файл>');
  process.exit(1);
}
let text;
try { text = fs.readFileSync(file, 'utf8'); }
catch { console.error(`Ошибка: файл не найден или недоступен: ${file}`); process.exit(1); }

const lines = text.split(/\r?\n/);
const starts = /^\s*-\s*\[([^\]])\]\s*\*\*(\d+)\.\*\*\s+тип:\s*(.+?)\s*$/i;
const field = /^\s*-?\s*(файл|строка|цитата|предложение|причина):\s*(.*?)\s*$/i;
const items = [];
for (let i = 0; i < lines.length; i++) {
  const match = lines[i].match(starts);
  if (!match) continue;
  const values = {};
  for (let j = i + 1; j < lines.length; j++) {
    if (starts.test(lines[j])) break;
    const f = lines[j].match(field);
    if (f) values[f[1].toLowerCase()] = f[2];
  }
  const checked = match[1].toLowerCase() === 'x';
  items.push({
    number: Number(match[2]), state: checked ? 'checked' : 'unchecked',
    type: match[3], file: values['файл'] ?? '', line: values['строка'] ?? '',
    quote: values['цитата'] ?? '', proposal: values['предложение'] ?? '',
    reason: values['причина'] ?? ''
  });
}
if (!items.length) {
  console.error('Ошибка: в тетради не найдено ни одного пункта строгого формата.');
  process.exit(1);
}
const selected = mode === 'checked' ? items.filter(item => item.state === 'checked') : items;
const output = { items: selected, summary: {
  total: items.length,
  checked: items.filter(item => item.state === 'checked').length,
  unchecked: items.filter(item => item.state === 'unchecked').length
} };
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
