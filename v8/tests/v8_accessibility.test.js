/**
 * Finanças Pediatria /v8/ - Acessibilidade de diálogos e avisos (VoiceOver / teclado)
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nextFocusIndex } from '../js/ui.js';

const V8_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('v8 - Acessibilidade', () => {
  it('nextFocusIndex: trap circular de Tab dentro do diálogo', () => {
    assert.equal(nextFocusIndex(0, -1, false), null);
    assert.equal(nextFocusIndex(4, 3, false), 0, 'Tab no último volta ao primeiro');
    assert.equal(nextFocusIndex(4, 0, true), 3, 'Shift+Tab no primeiro vai ao último');
    assert.equal(nextFocusIndex(4, 1, false), null, 'meio: Tab natural');
    assert.equal(nextFocusIndex(4, 2, true), null);
    assert.equal(nextFocusIndex(4, -1, false), 0, 'foco fora: entra no primeiro');
    assert.equal(nextFocusIndex(4, -1, true), 3);
    assert.equal(nextFocusIndex(1, 0, false), 0);
  });

  it('todos os diálogos têm role=dialog, aria-modal e aria-labelledby apontando para título existente', () => {
    const html = fs.readFileSync(path.join(V8_DIR, 'index.html'), 'utf-8');
    const dialogs = [...html.matchAll(/<div id="(modal-[\w-]+)"[^>]*role="dialog"[^>]*>/g)];
    assert.ok(dialogs.length >= 7);
    for (const m of dialogs) {
      assert.match(m[0], /aria-modal="true"/);
      const labelled = m[0].match(/aria-labelledby="([^"]+)"/)?.[1];
      assert.ok(labelled, `${m[1]} sem aria-labelledby`);
      assert.ok(html.includes(`id="${labelled}"`), `${m[1]}: título #${labelled} não existe`);
    }
  });

  it('ui/feedback.js gerencia foco (abrir/fechar), trap de Tab e roles dos toasts', () => {
    const ui = fs.readFileSync(path.join(V8_DIR, 'js', 'ui', 'feedback.js'), 'utf-8');
    assert.ok(ui.includes('_restoreFocus'));
    const events = fs.readFileSync(path.join(V8_DIR, 'js', 'ui', 'events.js'), 'utf-8');
    assert.ok(events.includes("e.key === 'Tab'"), 'trap de Tab ligado em events.js');
    assert.ok(ui.includes("type === 'error' ? 'alert' : 'status'"));
  });

  describe('Contraste WCAG AA dos tokens de cor (claro e escuro)', () => {
    const css = fs.readFileSync(path.join(V8_DIR, 'css', 'styles.css'), 'utf-8');
    const block = (selector) => {
      const start = css.indexOf(selector);
      assert.ok(start >= 0, `bloco ${selector} ausente`);
      return css.slice(start, css.indexOf('\n}', start));
    };
    const tokens = (b) => Object.fromEntries([...b.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
    const light = tokens(block(':root {'));
    const dark = { ...light, ...tokens(block('[data-theme="dark"] {')) };

    const parseColor = (v) => {
      if (/^#[0-9a-f]{6}$/i.test(v)) return { r: parseInt(v.slice(1, 3), 16), g: parseInt(v.slice(3, 5), 16), b: parseInt(v.slice(5, 7), 16), a: 1 };
      const m = v.match(/rgba?\(([^)]+)\)/);
      assert.ok(m, `cor não suportada: ${v}`);
      const p = m[1].split(',').map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
    };
    const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
    const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const contrast = (fg, bg) => { const [x, y] = [lum(fg), lum(bg)].sort((a, b) => b - a); return (x + 0.05) / (y + 0.05); };
    const resolve = (theme, name, base) => { const c = parseColor(theme[name] ?? name); return c.a < 1 ? over(c, base) : c; };

    for (const [themeName, theme] of [['claro', light], ['escuro', dark]]) {
      const white = { r: 255, g: 255, b: 255, a: 1 };
      const surfaces = ['bg-app', 'bg-card', 'bg-card-subtle', 'bg-input'];
      const base = resolve(theme, 'bg-app', white);
      const pairs = [];
      for (const fg of ['text-main', 'text-muted', 'text-light']) for (const s of surfaces) pairs.push([fg, s]);
      for (const fg of ['pink-text', 'coral-text', 'mint-text', 'amber-text', 'danger-text']) for (const s of ['bg-card', 'bg-app', 'bg-card-subtle']) pairs.push([fg, s]);
      pairs.push(['pink-text', 'primary-pink-light'], ['coral-text', 'coral-expense-light'], ['mint-text', 'mint-income-light']);

      it(`tema ${themeName}: textos e tokens semânticos têm contraste >= 4,5:1`, () => {
        for (const [fgName, bgName] of pairs) {
          const bg = resolve(theme, bgName, resolve(theme, 'bg-card', base));
          const fg = resolve(theme, fgName, bg);
          const ratio = contrast(fg, bg);
          assert.ok(ratio >= 4.5, `${fgName} sobre ${bgName} (${themeName}) = ${ratio.toFixed(2)} < 4,5`);
        }
      });

      it(`tema ${themeName}: texto branco sobre fundos sólidos de destaque >= 4,5:1`, () => {
        for (const solid of ['pink-solid', 'coral-solid']) {
          const ratio = contrast({ r: 255, g: 255, b: 255, a: 1 }, resolve(theme, solid, base));
          assert.ok(ratio >= 4.5, `branco sobre ${solid} (${themeName}) = ${ratio.toFixed(2)}`);
        }
      });
    }
  });

  describe('Regras de CSS e templates de acessibilidade', () => {
    const css = fs.readFileSync(path.join(V8_DIR, 'css', 'styles.css'), 'utf-8');
    const uiDir = path.join(V8_DIR, 'js', 'ui');

    it('respeita prefers-reduced-motion', () => {
      assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*animation-duration:\s*0\.01ms/);
    });

    it('nenhum texto menor que 12 px (0,75rem) no CSS', () => {
      const small = [...css.matchAll(/font-size:\s*(0?\.\d+)rem/g)].map(m => parseFloat(m[1])).filter(v => v < 0.75);
      assert.deepEqual(small, []);
    });

    it('define alvos mínimos de 44 px para botões, chips e navegação', () => {
      for (const sel of ['.icon-btn', '.month-nav-btn', '.modal-close-btn', '.btn-inst-edit', '.macro-chip', '.hospital-chip', '.cat-quick']) {
        assert.ok(css.includes(sel), `${sel} deve existir`);
      }
      assert.match(css, /min-width:\s*44px;\s*min-height:\s*44px/);
      assert.match(css, /\.nav-tab\s*\{\s*min-height:\s*48px/);
    });

    it('todo campo numérico de dinheiro usa inputmode="decimal" (teclado numérico no iPhone)', () => {
      for (const f of fs.readdirSync(uiDir).filter(n => n.endsWith('.js'))) {
        const lines = fs.readFileSync(path.join(uiDir, f), 'utf-8').split('\n');
        lines.forEach((line, i) => {
          if (!line.includes('type="number"')) return;
          const ctx = lines.slice(i, i + 8).join(' ');
          assert.ok(ctx.includes('inputmode="decimal"'), `${f}:${i + 1} sem inputmode`);
        });
      }
    });

    it('placeholders e navegação têm marcações ARIA', () => {
      assert.match(css, /::placeholder\s*\{\s*color:\s*var\(--text-muted\);\s*opacity:\s*1/);
      const html = fs.readFileSync(path.join(V8_DIR, 'index.html'), 'utf-8');
      assert.match(html, /id="current-month-title" aria-live="polite"/);
      assert.match(html, /data-regime="caixa" type="button" aria-pressed="true"/);
      assert.match(html, /id="tab-nav-home" type="button" aria-current="page"/);
    });
  });});
