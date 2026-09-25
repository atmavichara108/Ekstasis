#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const root = path.resolve(new URL('.', import.meta.url).pathname, '../..');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ekstasis-literary-'));
try {
  const notebook = path.join(dir, 'Тетрадь с пробелами.md');
  fs.writeFileSync(notebook, `# Тетрадь\n\n- [x] **1.** тип: норма\n  - файл: В поисках Пустоты/часть.md\n  - строка: 12\n  - цитата: «слово»\n  - предложение: «слово,»\n  - причина: запятая по правилу\n\n- [ ] **2.** тип: сомнение\n  - файл: В поисках Пустоты/часть.md\n  - строка: 20\n  - цитата: «ещё»\n  - предложение: «еще»\n  - причина: вариант нормы\n\n- [X] **3.** тип: возможно намеренное\n  - файл: В поисках Пустоты/часть.md\n  - строка: 30\n  - цитата: «слом»\n  - предложение: оставить\n  - причина: возможно приём\n`);
  const parser = path.join(root, 'tools/literary/corrections.mjs');
  const checked = JSON.parse(execFileSync(process.execPath, [parser, 'checked', notebook], { encoding: 'utf8' }));
  assert.deepEqual(checked.items.map(x => x.number), [1, 3]);
  assert.equal(checked.items[1].type, 'возможно намеренное');
  const list = JSON.parse(execFileSync(process.execPath, [parser, 'list', notebook], { encoding: 'utf8' }));
  assert.equal(list.items.length, 3); assert.deepEqual(list.summary, { total: 3, checked: 2, unchecked: 1 });
  const report = path.join(root, 'tools/literary/report-path.mjs');
  const expected = 'Отзывы/2026-09-25 — чтение — В поисках Нетленного.md';
  const existing = execFileSync(process.execPath, [report, '--kind', 'reading', '--selector', 'В поисках Пустоты/В поисках Нетленного.md', '--date', '2026-09-25'], { encoding: 'utf8' }).trim();
  assert.equal(existing, 'Отзывы/2026-09-25 — чтение — В поисках Нетленного (2).md');
  const fresh = execFileSync(process.execPath, [report, '--kind', 'critique', '--selector', 'Глава/Красная планета.md', '--date', '2099-01-02'], { encoding: 'utf8' }).trim();
  assert.equal(fresh, 'Отзывы/2099-01-02 — критика — Красная планета.md');
  const missing = spawnSync(process.execPath, [parser, 'list', path.join(dir, 'нет такого.md')]);
  assert.notEqual(missing.status, 0);
  console.log('SMOKE PASS: 5 проверок');
} finally { fs.rmSync(dir, { recursive: true, force: true }); }
