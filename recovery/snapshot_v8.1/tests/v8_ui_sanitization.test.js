/**
 * Finanças Pediatria /v8/ - Testes de Higienização de UI e Prevenção contra DOM XSS
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { escapeHtml } from '../js/ui.js';
import { sanitizeColor, getIconSvg } from '../js/icons.js';

describe('Finanças Pediatria /v8/ - Higienização de UI & Prevenção contra DOM XSS', () => {

  describe('1. Sanitização Textual Universal (escapeHtml)', () => {
    it('Trata valores nulos e indefinidos retornando string vazia', () => {
      assert.equal(escapeHtml(null), '');
      assert.equal(escapeHtml(undefined), '');
    });

    it('Escapa tags HTML e injeções de script perigosas', () => {
      const payload = '<script>alert("XSS")</script>';
      const safe = escapeHtml(payload);
      assert.equal(safe, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
      assert.ok(!safe.includes('<'));
      assert.ok(!safe.includes('>'));
    });

    it('Escapa aspas simples e duplas para segurança em atributos HTML', () => {
      const payload = 'Hospital "Geral" & \'Maternidade\'';
      const safe = escapeHtml(payload);
      assert.equal(safe, 'Hospital &quot;Geral&quot; &amp; &#39;Maternidade&#39;');
      assert.ok(!safe.includes('"'));
      assert.ok(!safe.includes("'"));
    });

    it('Escapa injeções em manipuladores de eventos on* e tags de imagem', () => {
      const payload = '<img src=x onerror=alert(1)>';
      const safe = escapeHtml(payload);
      assert.equal(safe, '&lt;img src=x onerror=alert(1)&gt;');
    });
  });

  describe('2. Sanitização Estrita de Cores (sanitizeColor)', () => {
    it('Permite códigos hexadecimais válidos de 3 e 6 dígitos', () => {
      assert.equal(sanitizeColor('#fff'), '#fff');
      assert.equal(sanitizeColor('#EC407A'), '#EC407A');
      assert.equal(sanitizeColor('#26A69A'), '#26A69A');
      assert.equal(sanitizeColor('#7E57C2'), '#7E57C2');
    });

    it('Permite palavras-chave seguras como currentColor', () => {
      assert.equal(sanitizeColor('currentColor'), 'currentColor');
      assert.equal(sanitizeColor('inherit'), 'inherit');
    });

    it('Rejeita injeções maliciosas em atributos de estilo e retorna o fallback', () => {
      const malicious = 'red; background: url("javascript:alert(1)");';
      const safe = sanitizeColor(malicious, '#E8A598');
      assert.equal(safe, '#E8A598');

      const tagEscape = '"><script>alert(1)</script>';
      const safeTag = sanitizeColor(tagEscape, 'currentColor');
      assert.equal(safeTag, 'currentColor');
    });
  });

  describe('3. Geração Segura de SVGs Inline (getIconSvg)', () => {
    it('Gera markup SVG inline com dimensões configuradas', () => {
      const svg = getIconSvg('stethoscope', 28);
      assert.ok(svg.includes('<svg'));
      assert.ok(svg.includes('width="28"'));
      assert.ok(svg.includes('height="28"'));
      assert.ok(svg.includes('viewBox="0 0 24 24"'));
    });

    it('Sanitiza a cor injetada no atributo style do SVG', () => {
      const svg = getIconSvg('hospital', { size: 24, color: '#26A69A' });
      assert.ok(svg.includes('color: #26A69A'));
      assert.ok(svg.includes('stroke: #26A69A'));
    });

    it('Bloqueia injeção de script através do parâmetro de cor do ícone', () => {
      const svg = getIconSvg('hospital', { size: 24, color: '"><script>alert(1)</script>' });
      assert.ok(!svg.includes('<script>'));
      assert.ok(!svg.includes('alert(1)'));
    });

    it('Fornece fallback seguro para ícones não mapeados sem quebra de tela', () => {
      const fallbackSvg = getIconSvg('icone_inexistente_hospitalar');
      assert.ok(fallbackSvg.includes('<svg'));
      assert.ok(fallbackSvg.includes('viewBox="0 0 24 24"'));
    });
  });
});
