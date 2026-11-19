/**
 * Finanças Pediatria /v8/ - Portabilidade GitHub Pages (subcaminho) & iOS
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const V8_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(V8_DIR, f), 'utf-8');

describe('v8 - Portabilidade GitHub Pages (/Nanda_ped/v8/) e ícones iOS', () => {
  it('index.html, CSS e JS não referenciam arquivos fora da pasta v8 (../)', () => {
    const files = ['index.html', 'css/styles.css', ...fs.readdirSync(path.join(V8_DIR, 'js')).map(f => `js/${f}`)];
    for (const f of files) {
      const hits = read(f).match(/(?:href|src|url\()\s*=?\s*["']?\.\.\//g) || [];
      assert.equal(hits.length, 0, `${f} referencia caminho fora da v8`);
    }
  });

  it('não usa caminhos absolutos (/...) para recursos locais', () => {
    const html = read('index.html');
    const abs = html.match(/(?:href|src)=["']\/(?!\/)[^"']*["']/g) || [];
    assert.deepEqual(abs, []);
    const manifest = JSON.parse(read('manifest.json'));
    assert.ok(manifest.start_url.startsWith('./'));
    assert.ok(manifest.scope.startsWith('./'));
  });

  it('todo recurso local referenciado em index.html, manifest.json e sw.js existe', () => {
    const html = read('index.html');
    const refs = [...html.matchAll(/(?:href|src)=["'](\.\/[^"'?#]+)["']/g)].map(m => m[1]);
    const manifest = JSON.parse(read('manifest.json'));
    refs.push(...manifest.icons.map(i => i.src));
    const sw = read('sw.js');
    refs.push(...[...sw.matchAll(/'(\.\/[^']+)'/g)].map(m => m[1]).filter(r => r !== './'));
    assert.ok(refs.length >= 8);
    for (const r of new Set(refs)) {
      assert.ok(fs.existsSync(path.join(V8_DIR, r)), `Arquivo ausente: ${r}`);
    }
  });

  it('apple-touch-icon e favicon apontam para assets da própria v8', () => {
    const html = read('index.html');
    assert.match(html, /rel="apple-touch-icon" href="\.\/assets\/icons\/apple-touch-icon\.png"/);
    assert.match(html, /rel="icon"[^>]*href="\.\/assets\/icons\/favicon\.png"/);
  });

  it('manifest.json é JSON válido sem BOM e sem ícones "maskable" sem área segura', () => {
    const raw = fs.readFileSync(path.join(V8_DIR, 'manifest.json'));
    assert.notEqual(raw[0], 0xEF, 'manifest.json não deve ter BOM');
    const manifest = JSON.parse(raw.toString('utf-8'));
    for (const icon of manifest.icons) assert.ok(!/maskable/.test(icon.purpose || ''));
  });

  it('CSP e CSS não dependem de fontes externas (offline real)', () => {
    const html = read('index.html');
    const css = read('css/styles.css');
    assert.ok(!/googleapis|gstatic/.test(html), 'index.html não deve citar Google Fonts');
    assert.ok(!/googleapis|gstatic|@import\s+url\(["']?https?:/.test(css), 'CSS não deve importar fontes externas');
  });

  it('isBackupStale: lembra só quando há dados e o último backup passou de 14 dias', async () => {
    const { isBackupStale } = await import('../js/storage.js');
    const now = Date.parse('2026-11-18T12:00:00Z');
    const day = 24 * 60 * 60 * 1000;
    assert.equal(isBackupStale({ shifts: [], expenses: [] }, now), false, 'sem dados não lembra');
    assert.equal(isBackupStale(null, now), false);
    assert.equal(isBackupStale({ shifts: [{}], preferences: {} }, now), true, 'nunca fez backup');
    assert.equal(isBackupStale({ expenses: [{}], preferences: { lastBackupAt: new Date(now - 3 * day).toISOString() } }, now), false);
    assert.equal(isBackupStale({ expenses: [{}], preferences: { lastBackupAt: new Date(now - 15 * day).toISOString() } }, now), true);
  });

  it('Service Worker ignora query string no cache e mantém cache versionado', () => {
    const sw = read('sw.js');
    assert.match(sw, /CACHE_NAME = 'financas-pediatria-v8-static-v\d+'/);
    assert.ok(sw.includes('ignoreSearch: true'));
  });
});
