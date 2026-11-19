/**
 * Finanças Pediatria /v8/ - Seletor de categorias em grupos (macro) e subgrupos (micro)
 * Funções puras (sem DOM): montam a árvore e o HTML do seletor da "Nova Despesa".
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { MACRO_GROUPS } from '../store.js';
import { getIconSvg, sanitizeColor } from '../icons.js';
import { escapeHtml } from './helpers.js';

/**
 * Subgrupos (micro) por assunto correlacionado, dentro de cada grupo (macro).
 * As categorias são ligadas pelo nome; categorias criadas pela usuária (ou renomeadas)
 * que não constem aqui entram em "Minhas categorias" do grupo escolhido.
 */
export const MICRO_GROUPS = {
  macro_alimentacao: [
    { id: 'alim_dia_a_dia', name: 'No dia a dia', icon: 'cart', categories: ['Mercantil', 'Lanches'] },
    { id: 'alim_prontas', name: 'Refeições prontas', icon: 'meal', categories: ['Refeição', 'Delivery'] }
  ],
  macro_transporte: [
    { id: 'transp_dia_a_dia', name: 'No dia a dia', icon: 'car', categories: ['Combustível', 'Uber'] },
    { id: 'transp_viagens', name: 'Viagens', icon: 'flight', categories: ['Passagens'] }
  ],
  macro_moradia: [
    { id: 'morad_casa', name: 'Casa', icon: 'home', categories: ['Aluguel'] },
    { id: 'morad_contas', name: 'Contas de casa', icon: 'bolt', categories: ['Energia', 'Água', 'Internet'] }
  ],
  macro_formacao: [
    { id: 'form_estudos', name: 'Estudos', icon: 'study', categories: ['Estudo', 'Cursos'] },
    { id: 'form_eventos', name: 'Congressos e pós', icon: 'qualification', categories: ['Qualificação/Congresso/Pós'] }
  ],
  macro_saude: [
    { id: 'saude_cuidados', name: 'Saúde', icon: 'heart_pulse', categories: ['Remédios', 'Fisioterapia'] },
    { id: 'saude_bemestar', name: 'Bem-estar', icon: 'fitness', categories: ['Academia'] },
    { id: 'saude_beleza', name: 'Beleza', icon: 'beauty', categories: ['Beleza/Salão', 'Produtos de beleza'] }
  ],
  macro_lazer_outros: [
    { id: 'lazer_diversao', name: 'Lazer', icon: 'outing', categories: ['Saídas'] },
    { id: 'lazer_afeto', name: 'Afeto e solidariedade', icon: 'gift', categories: ['Presentes', 'Doação'] },
    { id: 'lazer_compras', name: 'Compras', icon: 'credit_card', categories: ['Compras Parceladas'] }
  ]
};

export const CUSTOM_SUBGROUP_NAME = 'Minhas categorias';
const FALLBACK_QUICK = ['Mercantil', 'Refeição', 'Uber', 'Remédios'];

/** Normaliza texto para busca (sem acentos, minúsculas) */
export function normalizeSearch(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Monta a árvore macro > micro > categorias a partir das categorias ativas.
 * Grupos e subgrupos vazios são omitidos.
 */
export function buildCategoryTree(categories, macroGroups = MACRO_GROUPS, micro = MICRO_GROUPS) {
  const list = Array.isArray(categories) ? categories : [];
  const byKey = new Map(list.map(c => [normalizeSearch(c.name), c]));
  const placed = new Set();
  const fallbackMacro = macroGroups[macroGroups.length - 1];

  const tree = macroGroups.map(macro => {
    const subgroups = (micro[macro.id] || []).map(sub => {
      const cats = [];
      for (const name of sub.categories) {
        const cat = byKey.get(normalizeSearch(name));
        if (cat && !placed.has(cat)) { cats.push(cat); placed.add(cat); }
      }
      return { id: sub.id, name: sub.name, icon: sub.icon, categories: cats };
    });
    return { id: macro.id, name: macro.name, icon: macro.icon, color: macro.color, subgroups };
  });

  // Categorias da usuária / renomeadas: vão para "Minhas categorias" do seu macro-grupo
  const extras = list.filter(c => !placed.has(c)).sort((a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR'));
  for (const cat of extras) {
    const target = tree.find(t => t.name === (cat.macro_group || cat.macroGroup)) || tree.find(t => t.id === fallbackMacro.id);
    let sub = target.subgroups.find(s => s.id === `${target.id}_custom`);
    if (!sub) {
      sub = { id: `${target.id}_custom`, name: CUSTOM_SUBGROUP_NAME, icon: 'sparkles', categories: [] };
      target.subgroups.push(sub);
    }
    sub.categories.push(cat);
  }

  return tree
    .map(t => ({ ...t, subgroups: t.subgroups.filter(s => s.categories.length > 0) }))
    .filter(t => t.subgroups.length > 0)
    .map(t => ({ ...t, count: t.subgroups.reduce((n, s) => n + s.categories.length, 0) }));
}

/** Filtra a árvore por texto (nome da categoria, do subgrupo ou do grupo) */
export function filterCategoryTree(tree, query) {
  const q = normalizeSearch(query);
  if (!q) return tree;
  return tree
    .map(t => {
      const macroHit = normalizeSearch(t.name).includes(q);
      const subgroups = t.subgroups
        .map(s => {
          const subHit = macroHit || normalizeSearch(s.name).includes(q);
          const categories = s.categories.filter(c => subHit || normalizeSearch(c.name).includes(q));
          return { ...s, categories };
        })
        .filter(s => s.categories.length > 0);
      return { ...t, subgroups, count: subgroups.reduce((n, s) => n + s.categories.length, 0) };
    })
    .filter(t => t.subgroups.length > 0);
}

/** Categorias de atalho: as mais usadas nos lançamentos (ou sugestões iniciais) */
export function getQuickCategories(expenses, categories, limit = 4) {
  const active = new Map((categories || []).map(c => [normalizeSearch(c.name), c]));
  const counts = new Map();
  for (const e of expenses || []) {
    const key = normalizeSearch(e.category_name_snapshot);
    if (active.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => active.get(k));
  for (const name of FALLBACK_QUICK) {
    const cat = active.get(normalizeSearch(name));
    if (cat && !ranked.includes(cat)) ranked.push(cat);
  }
  return ranked.slice(0, limit);
}

/** Cor segura (hex) para uso em variável CSS */
function safeColor(color, fallback = '#AB47BC') {
  return sanitizeColor(color, fallback);
}

function iconBubble(iconName, color, size = 18) {
  return `<span class="cat-icon" style="--cat-color: ${safeColor(color)};">${getIconSvg(iconName || 'tag', { size })}</span>`;
}

/** Texto e ícone do botão que mostra a categoria escolhida */
export function renderTriggerHtml(cat, macroName) {
  if (!cat) {
    return `<span class="cat-icon" style="--cat-color: #AB47BC;">${getIconSvg('tag', { size: 20 })}</span>
      <span class="cat-trigger-text"><strong>Escolher categoria</strong><small>Toque para ver os grupos</small></span>`;
  }
  return `${iconBubble(cat.icon, cat.color, 20)}
    <span class="cat-trigger-text"><strong>${escapeHtml(cat.name)}</strong><small>${escapeHtml(macroName || cat.macro_group || '')}</small></span>`;
}

function tileHtml(cat, selectedName) {
  const selected = cat.name === selectedName;
  return `
    <button type="button" class="cat-tile${selected ? ' selected' : ''}" data-cat-pick="${escapeHtml(cat.name)}"
      data-default-amount="${cat.default_amount || ''}" data-default-payment="${escapeHtml(cat.default_payment_type || 'a_vista')}"
      aria-pressed="${selected ? 'true' : 'false'}">
      ${iconBubble(cat.icon, cat.color, 18)}
      <span class="cat-tile-name">${escapeHtml(cat.name)}</span>
      <span class="cat-check" aria-hidden="true">${getIconSvg('check', { size: 14 })}</span>
    </button>`;
}

/**
 * HTML dos grupos (sanfona). Com `expandAll` (busca ativa) todos abrem;
 * caso contrário abre só o grupo da categoria selecionada.
 */
export function renderTreeHtml(tree, selectedName, { expandAll = false } = {}) {
  if (!tree.length) return '';
  const selectedMacro = tree.find(t => t.subgroups.some(s => s.categories.some(c => c.name === selectedName)));
  return tree.map(t => {
    const open = expandAll || (selectedMacro ? selectedMacro.id === t.id : t === tree[0]);
    const body = t.subgroups.map(s => `
      <div class="cat-sub">
        <p class="cat-sub-title"><span aria-hidden="true">${getIconSvg(s.icon || 'tag', { size: 14 })}</span>${escapeHtml(s.name)}</p>
        <div class="cat-grid">${s.categories.map(c => tileHtml(c, selectedName)).join('')}</div>
      </div>`).join('');
    return `
      <section class="cat-macro${open ? ' open' : ''}" data-macro="${escapeHtml(t.id)}" style="--macro-color: ${safeColor(t.color)};">
        <button type="button" class="cat-macro-head" data-cat-macro-toggle aria-expanded="${open ? 'true' : 'false'}">
          <span class="cat-icon cat-icon-lg">${getIconSvg(t.icon || 'tag', { size: 20 })}</span>
          <span class="cat-macro-name">${escapeHtml(t.name)}</span>
          <span class="cat-macro-count">${t.count}</span>
          <span class="cat-chevron" aria-hidden="true">${getIconSvg('chevron_down', { size: 18 })}</span>
        </button>
        <div class="cat-macro-body"${open ? '' : ' hidden'}>${body}</div>
      </section>`;
  }).join('');
}

/** Atalhos "Mais usadas" (visíveis sem abrir a lista) */
export function renderQuickHtml(quickCats, selectedName) {
  return quickCats.map(c => `
    <button type="button" class="cat-quick${c.name === selectedName ? ' selected' : ''}" data-cat-chip="${escapeHtml(c.name)}"
      data-default-amount="${c.default_amount || ''}" data-default-payment="${escapeHtml(c.default_payment_type || 'a_vista')}">
      ${iconBubble(c.icon, c.color, 14)}<span>${escapeHtml(c.name)}</span>
    </button>`).join('');
}

// ===========================================================================
// Filtros (aba Despesas), gestão de categorias e escolha de grupo
// ===========================================================================

/** Chips de grupo (macro) para filtrar as despesas: "Todas" + os 6 grupos com ícone colorido */
export function renderMacroChipsHtml(selectedMacro, macroGroups = MACRO_GROUPS) {
  const all = `
    <button class="macro-chip ${selectedMacro === 'all' ? 'active' : ''}" data-macro-filter="all" type="button" aria-pressed="${selectedMacro === 'all'}">
      <span class="macro-chip-icon" aria-hidden="true">${getIconSvg('layers', { size: 14 })}</span>Todas
    </button>`;
  return all + macroGroups.map(mg => `
    <button class="macro-chip ${selectedMacro === mg.name ? 'active' : ''}" data-macro-filter="${escapeHtml(mg.name)}" type="button"
      aria-pressed="${selectedMacro === mg.name}" style="--macro-color: ${safeColor(mg.color)};">
      <span class="macro-chip-icon" aria-hidden="true">${getIconSvg(mg.icon || 'tag', { size: 14 })}</span>${escapeHtml(mg.name)}
    </button>`).join('');
}

/** Chips de subgrupo (micro) do grupo escolhido; retorna '' quando não há grupo selecionado */
export function renderMicroChipsHtml(tree, selectedMacro, selectedMicro) {
  const node = tree.find(t => t.name === selectedMacro);
  if (!node) return '';
  const chip = (id, label, icon, count) => `
    <button class="micro-chip ${selectedMicro === id ? 'active' : ''}" data-micro-filter="${escapeHtml(id)}" type="button" aria-pressed="${selectedMicro === id}">
      <span aria-hidden="true">${getIconSvg(icon || 'tag', { size: 13 })}</span>${escapeHtml(label)}<small>${count}</small>
    </button>`;
  return chip('all', `Tudo em ${node.name}`, node.icon, node.count)
    + node.subgroups.map(s => chip(s.id, s.name, s.icon, s.categories.length)).join('');
}

/** Nomes de categoria de um subgrupo (null = sem filtro de subgrupo) */
export function getMicroCategoryNames(tree, selectedMacro, selectedMicro) {
  if (!selectedMicro || selectedMicro === 'all') return null;
  const node = tree.find(t => t.name === selectedMacro);
  const sub = node?.subgroups.find(s => s.id === selectedMicro);
  return sub ? sub.categories.map(c => c.name) : null;
}

/** Lista de gestão de categorias (modal "Categorias de Despesas"): grupos > subgrupos > linhas com ícone */
export function renderManageTreeHtml(tree) {
  return tree.map((t, i) => `
    <section class="cat-macro${i === 0 ? ' open' : ''}" data-macro="${escapeHtml(t.id)}" style="--macro-color: ${safeColor(t.color)};">
      <button type="button" class="cat-macro-head" data-cat-macro-toggle aria-expanded="${i === 0 ? 'true' : 'false'}">
        <span class="cat-icon cat-icon-lg">${getIconSvg(t.icon || 'tag', { size: 20 })}</span>
        <span class="cat-macro-name">${escapeHtml(t.name)}</span>
        <span class="cat-macro-count">${t.count}</span>
        <span class="cat-chevron" aria-hidden="true">${getIconSvg('chevron_down', { size: 18 })}</span>
      </button>
      <div class="cat-macro-body"${i === 0 ? '' : ' hidden'}>
        ${t.subgroups.map(s => `
          <div class="cat-sub">
            <p class="cat-sub-title"><span aria-hidden="true">${getIconSvg(s.icon || 'tag', { size: 14 })}</span>${escapeHtml(s.name)}</p>
            <div class="cat-manage-list">
              ${s.categories.map(c => `
                <div class="cat-manage-row${c.active === false ? ' archived' : ''}">
                  ${iconBubble(c.icon, c.color, 18)}
                  <span class="cat-manage-name">${escapeHtml(c.name)}</span>
                  ${c.isCustom && c.active !== false
                    ? `<button type="button" class="btn-icon-delete" data-delete-cat="${escapeHtml(c.id)}" aria-label="Excluir categoria ${escapeHtml(c.name)}" title="Excluir categoria">${getIconSvg('trash', { size: 16, color: '#EF5350' })}</button>`
                    : c.active === false
                      ? '<span class="badge-status-pill muted">Arquivada</span>'
                      : '<span class="badge-status-pill safe">Canônica</span>'}
                </div>`).join('')}
            </div>
          </div>`).join('')}
      </div>
    </section>`).join('');
}

/** Escolha visual do grupo (macro) ao criar categoria: radios estilizados como cartões com ícone */
export function renderMacroRadiosHtml(selectedName, macroGroups = MACRO_GROUPS, fieldName = 'macro_group') {
  const selected = macroGroups.some(m => m.name === selectedName) ? selectedName : macroGroups[0].name;
  return macroGroups.map(mg => `
    <label class="macro-radio" style="--macro-color: ${safeColor(mg.color)};">
      <input type="radio" name="${escapeHtml(fieldName)}" value="${escapeHtml(mg.name)}"${mg.name === selected ? ' checked' : ''} />
      <span class="macro-radio-card">
        <span class="cat-icon">${getIconSvg(mg.icon || 'tag', { size: 18 })}</span>
        <span class="macro-radio-name">${escapeHtml(mg.name)}</span>
      </span>
    </label>`).join('');
}