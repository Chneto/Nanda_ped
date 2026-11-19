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

  it('ui.js gerencia foco (abrir/fechar), trap de Tab e roles dos toasts', () => {
    const ui = fs.readFileSync(path.join(V8_DIR, 'js', 'ui.js'), 'utf-8');
    assert.ok(ui.includes('_restoreFocus'));
    assert.ok(ui.includes("e.key === 'Tab'"));
    assert.ok(ui.includes("type === 'error' ? 'alert' : 'status'"));
  });
});
