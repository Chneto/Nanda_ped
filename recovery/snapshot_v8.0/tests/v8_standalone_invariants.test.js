/**
 * Finanças Pediatria /v8/ - Testes de Invariantes Arquiteturais Standalone & Zero-Cloud
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const V8_DIR = path.resolve(__dirname, '..');

describe('Finanças Pediatria /v8/ - Invariantes Arquiteturais Standalone & Zero-Cloud', () => {

  describe('1. Expurgamento Integral de Nuvem & Abertura Instantânea sem Login', () => {
    const indexPath = path.join(V8_DIR, 'index.html');
    const indexHtml = fs.readFileSync(indexPath, 'utf-8');

    it('v8/index.html NÃO possui nenhuma tag <script src="https://..."> (zero CDN externa)', () => {
      const externalScripts = indexHtml.match(/<script[^>]+src=["']https?:\/\/[^"']+["']/gi) || [];
      assert.equal(externalScripts.length, 0, `Encontrados scripts externos via CDN: ${externalScripts.join(', ')}`);
    });

    it('v8/index.html NÃO contém referências ao SDK Supabase nem telas de login / Silk Gate', () => {
      assert.ok(!indexHtml.includes('@supabase/supabase-js'), 'Não deve importar SDK Supabase');
      assert.ok(!indexHtml.includes('silk-gate-screen'), 'Não deve conter tela bloqueante silk-gate-screen');
      assert.ok(!indexHtml.includes('silk-gate-wrapper'), 'Não deve conter container silk-gate-wrapper');
      assert.ok(!indexHtml.includes('form-password-auth'), 'Não deve conter formulário de senha/login');
      assert.ok(!indexHtml.includes('form-magic-link'), 'Não deve conter formulário de magic link');
    });

    it('v8/index.html abre diretamente com o painel principal desimpedido', () => {
      assert.ok(indexHtml.includes('id="main-app-screen"'), 'Deve conter container main-app-screen');
      // O main-app-screen NÃO deve ter a classe hidden
      assert.match(indexHtml, /<main id="main-app-screen" class="main-app-wrapper"/);
      assert.ok(indexHtml.includes('id="view-home" class="app-view active"'), 'Deve ativar diretamente a view-home');
    });

    it('Código-fonte em v8/js/ NÃO possui chamadas ao endpoint de nuvem /api/config', () => {
      const jsDir = path.join(V8_DIR, 'js');
      const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(jsDir, file), 'utf-8');
        assert.ok(!content.includes('/api/config'), `Arquivo ${file} faz requisição a /api/config`);
        assert.ok(!content.includes('supabase.co'), `Arquivo ${file} contém referências a supabase.co`);
      }
    });
  });

  describe('2. Content Security Policy (CSP) Estrita para PWA e GitHub Pages', () => {
    const indexPath = path.join(V8_DIR, 'index.html');
    const indexHtml = fs.readFileSync(indexPath, 'utf-8');

    it('v8/index.html embutiu meta tag CSP estrita', () => {
      assert.ok(indexHtml.includes('http-equiv="Content-Security-Policy"'));
    });

    it('A diretiva script-src é estritamente "self" (zero scripts remotos ou CDNs)', () => {
      const cspMatch = indexHtml.match(/http-equiv="Content-Security-Policy"[^>]*content="([^"]+)"/i) ||
                       indexHtml.match(/content="([^"]+)"[^>]*http-equiv="Content-Security-Policy"/i);
      assert.ok(cspMatch, 'Meta tag CSP deve ter atributo content');
      const csp = cspMatch[1];
      assert.match(csp, /script-src 'self'/);
      assert.ok(!csp.includes('jsdelivr.net'), 'CSP não deve permitir jsdelivr');
      assert.ok(!csp.includes('supabase.co'), 'CSP não deve conectar ao supabase');
    });
  });

  describe('3. Ergonomia iPhone 16 Plus (Safe-Areas, Anti-Zoom >= 16px e Anti-Crop)', () => {
    const cssPath = path.join(V8_DIR, 'css', 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    it('Aplica regra inviolável anti-zoom no Safari iOS (font-size >= 16px !important)', () => {
      assert.ok(cssContent.includes('font-size: 16px !important'));
      assert.match(cssContent, /input,\s*select,\s*textarea/);
    });

    it('Limita a largura máxima a 430px centralizada no iPhone 16 Plus', () => {
      assert.ok(cssContent.includes('max-width: 430px'));
    });

    it('Respeita safe-areas nativas do iOS env(safe-area-inset-top) e bottom', () => {
      assert.ok(cssContent.includes('env(safe-area-inset-top'));
      assert.ok(cssContent.includes('env(safe-area-inset-bottom'));
    });

    it('Aplica arquitetura in-flow expansion anti-crop nos modais (position: relative !important)', () => {
      assert.match(cssContent, /\.modal-sheet\s*\{[^}]*position:\s*relative\s*!important/);
    });
  });

  describe('4. Autoria Canônica e Integridade de Metadados (FChNeto)', () => {
    it('Autor canônico FChNeto preservado nas meta tags de v8/index.html', () => {
      const indexHtml = fs.readFileSync(path.join(V8_DIR, 'index.html'), 'utf-8');
      assert.ok(indexHtml.includes('<meta name="author" content="FChNeto"'));
      assert.ok(indexHtml.includes('<meta name="creator" content="FChNeto"'));
      assert.ok(indexHtml.includes('<meta name="app-creator" content="FChNeto"'));
      assert.ok(indexHtml.includes('FChNeto</strong>'));
    });

    it('Autor canônico FChNeto preservado no manifest.json e sw.js', () => {
      const manifest = fs.readFileSync(path.join(V8_DIR, 'manifest.json'), 'utf-8');
      assert.ok(manifest.includes('FChNeto'));
      assert.ok(manifest.includes('financas-pediatria-v8'));

      const sw = fs.readFileSync(path.join(V8_DIR, 'sw.js'), 'utf-8');
      assert.ok(sw.includes('FChNeto'));
      assert.ok(sw.includes('financas-pediatria-v8-static-v1'));
    });

    it('Autor canônico FChNeto exportado em v8/js/store.js, icons.js e app.js', async () => {
      const storeModule = await import('../js/store.js');
      assert.equal(storeModule.APP_CREATOR, 'FChNeto');

      const iconsModule = await import('../js/icons.js');
      assert.equal(iconsModule.APP_CREATOR, 'FChNeto');

      const appModule = await import('../js/app.js');
      assert.equal(appModule.APP_CREATOR, 'FChNeto');
    });
  });
});
