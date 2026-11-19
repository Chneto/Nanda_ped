/**
 * Finanças Pediatria /v8/ - Sondas de acessibilidade executadas dentro da página (page.evaluate)
 * Sem dependências: as funções são serializadas pelo Playwright, então devem ser autocontidas.
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

/** Retorna todos os textos visíveis com razão de contraste (pior caso em fundos com gradiente) */
export function probeContrast() {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,/ ]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
  };
  const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

  const background = (el) => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && /gradient/.test(cs.backgroundImage)) {
        const cols = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []).map(parse).filter(Boolean);
        if (cols.length) { layers.push({ gradient: cols }); break; }
      }
      const bg = parse(cs.backgroundColor);
      if (bg && bg.a > 0) { layers.push(bg); if (bg.a === 1) break; }
    }
    let base = parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
    if (base.a < 1) base = { r: 255, g: 255, b: 255, a: 1 };
    layers.reverse();
    const grad = layers.find((l) => l.gradient);
    if (grad) return grad.gradient.map((g) => over(g, base));
    let b = base;
    for (const l of layers) b = over(l, b);
    return [b];
  };

  const out = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.textContent.trim();
    const el = node.parentElement;
    if (!text || !el || seen.has(el)) continue;
    let hidden = false;
    let opacity = 1;
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.display === 'none' || s.visibility === 'hidden' || n.hasAttribute('hidden')) { hidden = true; break; }
      opacity *= Number(s.opacity);
    }
    const rect = el.getBoundingClientRect();
    if (hidden || opacity === 0 || rect.width < 2 || rect.height < 2) continue;
    seen.add(el);
    const cs = getComputedStyle(el);
    const fgRaw = parse(cs.color);
    if (!fgRaw) continue;
    const fg = { ...fgRaw, a: fgRaw.a * opacity };
    const worst = Math.min(...background(el).map((bg) => ratio(over(fg, bg), bg)));
    const size = parseFloat(cs.fontSize);
    const large = size >= 24 || (Number(cs.fontWeight) >= 700 && size >= 18.66);
    out.push({ text: text.slice(0, 40), cls: String(el.className || el.tagName).slice(0, 40), ratio: Math.round(worst * 100) / 100, need: large ? 3 : 4.5, size });
  }
  return out;
}

/** Retorna controles interativos visíveis com menos de 44 px em alguma dimensão */
export function probeSmallTargets() {
  const sel = 'button, a[href], input:not([type=hidden]), select, textarea, [role=button], summary';
  return [...document.querySelectorAll(sel)]
    .filter((el) => {
      for (let n = el; n; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (s.display === 'none' || s.visibility === 'hidden' || n.hasAttribute('hidden')) return false;
      }
      if ((el.type === 'radio' || el.type === 'checkbox') && el.closest('label')) return false; // a <label> é o alvo
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    })
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { id: el.id, cls: String(el.className || el.tagName).slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), text: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24) };
    })
    .filter((x) => x.w < 44 || x.h < 44);
}
