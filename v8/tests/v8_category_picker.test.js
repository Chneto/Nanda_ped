/**
 * Finanças Pediatria /v8/ - Seletor de categorias em grupos (macro) e subgrupos (micro)
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CATEGORIES, MACRO_GROUPS } from '../js/store.js';
import { SVG_ICONS } from '../js/icons.js';
import {
  MICRO_GROUPS, buildCategoryTree, filterCategoryTree, getQuickCategories,
  normalizeSearch, renderTreeHtml, renderQuickHtml, renderTriggerHtml, CUSTOM_SUBGROUP_NAME,
  renderMacroChipsHtml, renderMicroChipsHtml, getMicroCategoryNames, renderManageTreeHtml, renderMacroRadiosHtml
} from '../js/ui/category-picker.js';

const defaults = () => DEFAULT_CATEGORIES.map(c => ({ ...c }));
const allNames = (tree) => tree.flatMap(t => t.subgroups.flatMap(s => s.categories.map(c => c.name)));

describe('v8 - Seletor de categorias (macro > micro)', () => {
  it('as 23 categorias canônicas aparecem exatamente uma vez, nos 6 grupos', () => {
    const tree = buildCategoryTree(defaults());
    assert.equal(tree.length, 6);
    const names = allNames(tree);
    assert.equal(names.length, 23);
    assert.equal(new Set(names).size, 23, 'sem duplicatas');
    for (const c of DEFAULT_CATEGORIES) assert.ok(names.includes(c.name), `faltou ${c.name}`);
  });

  it('cada categoria canônica está no subgrupo do seu macro-grupo oficial', () => {
    const tree = buildCategoryTree(defaults());
    for (const macro of MACRO_GROUPS) {
      const node = tree.find(t => t.id === macro.id);
      assert.ok(node, `grupo ${macro.name} ausente`);
      assert.deepEqual(allNames([node]).sort(), [...macro.categories].sort(), `categorias de ${macro.name}`);
    }
  });

  it('MICRO_GROUPS referencia só categorias e ícones existentes', () => {
    const known = new Set(DEFAULT_CATEGORIES.map(c => c.name));
    for (const [macroId, subs] of Object.entries(MICRO_GROUPS)) {
      assert.ok(MACRO_GROUPS.some(m => m.id === macroId), `macro ${macroId}`);
      for (const s of subs) {
        assert.ok(SVG_ICONS[s.icon], `ícone ${s.icon} do subgrupo ${s.name}`);
        for (const n of s.categories) assert.ok(known.has(n), `categoria ${n} desconhecida`);
      }
    }
    for (const m of MACRO_GROUPS) assert.ok(SVG_ICONS[m.icon], `ícone do grupo ${m.name}`);
  });

  it('categoria criada pela usuária entra em "Minhas categorias" do seu grupo (grupo inválido cai no último)', () => {
    const cats = defaults();
    cats.push({ id: 'cat_livros', name: 'Livros Médicos', icon: 'study', color: '#42A5F5', macro_group: 'Formação & Carreira' });
    cats.push({ id: 'cat_x', name: 'Sem Grupo Válido', icon: 'tag', color: '#123456', macro_group: 'Inexistente' });
    const tree = buildCategoryTree(cats);
    const formacao = tree.find(t => t.id === 'macro_formacao');
    const custom = formacao.subgroups.find(s => s.name === CUSTOM_SUBGROUP_NAME);
    assert.deepEqual(custom.categories.map(c => c.name), ['Livros Médicos']);
    const fallback = tree.find(t => t.id === 'macro_lazer_outros').subgroups.find(s => s.name === CUSTOM_SUBGROUP_NAME);
    assert.ok(fallback.categories.some(c => c.name === 'Sem Grupo Válido'), 'grupo inválido cai em Pessoal, Lazer & Outros');
    assert.equal(allNames(tree).length, 25);
  });

  it('grupos vazios são omitidos quando faltam categorias', () => {
    const cats = defaults().filter(c => c.macro_group !== 'Alimentação');
    const tree = buildCategoryTree(cats);
    assert.equal(tree.length, 5);
    assert.ok(!tree.some(t => t.id === 'macro_alimentacao'));
  });

  it('busca ignora acentos e caixa, e acha por nome de categoria, subgrupo ou grupo', () => {
    const tree = buildCategoryTree(defaults());
    assert.equal(normalizeSearch('  ÁGUA '), 'agua');
    assert.deepEqual(allNames(filterCategoryTree(tree, 'agua')), ['Água']);
    assert.deepEqual(allNames(filterCategoryTree(tree, 'REFEICAO')), ['Refeição']);
    assert.deepEqual(allNames(filterCategoryTree(tree, 'Refeições prontas')).sort(), ['Delivery', 'Refeição'], 'busca pelo nome do subgrupo');
    assert.deepEqual(allNames(filterCategoryTree(tree, 'contas de casa')).sort(), ['Energia', 'Internet', 'Água'].sort());
    assert.equal(allNames(filterCategoryTree(tree, 'saúde & auto')).length, 5, 'busca por grupo traz todas as categorias dele');
    assert.deepEqual(filterCategoryTree(tree, 'zzzz'), []);
    assert.equal(filterCategoryTree(tree, '  '), tree);
  });

  it('atalhos: mais usadas primeiro, completando com sugestões iniciais', () => {
    const cats = defaults();
    const exps = [
      { category_name_snapshot: 'Uber' }, { category_name_snapshot: 'Uber' }, { category_name_snapshot: 'Uber' },
      { category_name_snapshot: 'Academia' }, { category_name_snapshot: 'Academia' },
      { category_name_snapshot: 'Categoria Apagada' }
    ];
    assert.deepEqual(getQuickCategories(exps, cats, 3).map(c => c.name), ['Uber', 'Academia', 'Mercantil']);
    assert.deepEqual(getQuickCategories([], cats, 4).map(c => c.name), ['Mercantil', 'Refeição', 'Uber', 'Remédios']);
    assert.equal(getQuickCategories([], [], 4).length, 0);
  });

  it('HTML: sanfona abre só o grupo selecionado, marca a categoria e não deixa XSS passar', () => {
    const cats = defaults();
    cats.push({ id: 'cat_evil', name: '<img src=x onerror=alert(1)>', icon: 'tag', color: 'red;background:url(javascript:1)', macro_group: 'Alimentação' });
    const tree = buildCategoryTree(cats);
    const html = renderTreeHtml(tree, 'Uber');
    assert.equal((html.match(/class="cat-macro open"/g) || []).length, 1);
    assert.match(html, /data-macro="macro_transporte"[^>]*>\s*<button[^>]*aria-expanded="true"/);
    assert.match(html, /data-cat-pick="Uber"[^>]*aria-pressed="true"/);
    assert.ok(!html.includes('<img src=x'), 'nome da categoria deve ser escapado');
    assert.ok(!html.includes('javascript:'), 'cor inválida deve ser descartada');
    assert.equal((renderTreeHtml(tree, 'Uber', { expandAll: true }).match(/class="cat-macro open"/g) || []).length, 6);
    assert.equal(renderTreeHtml([], 'Uber'), '');
  });

  it('HTML: botão mostra ícone, nome e grupo; atalhos expõem data-cat-chip', () => {
    const cat = DEFAULT_CATEGORIES.find(c => c.name === 'Energia');
    const trigger = renderTriggerHtml(cat, 'Moradia & Contas');
    assert.ok(trigger.includes('<strong>Energia</strong>') && trigger.includes('Moradia &amp; Contas'));
    assert.ok(renderTriggerHtml(null).includes('Escolher categoria'));
    const quick = renderQuickHtml([cat], 'Energia');
    assert.match(quick, /data-cat-chip="Energia"/);
    assert.match(quick, /cat-quick selected/);
  });
});

describe('v8 - Filtros, gestão e escolha de grupo (macro > micro)', () => {
  it('chips de grupo: "Todas" + 6 grupos com ícone; só o selecionado fica ativo', () => {
    const html = renderMacroChipsHtml('Alimentação');
    assert.equal((html.match(/data-macro-filter=/g) || []).length, 7);
    assert.equal((html.match(/macro-chip active/g) || []).length, 1);
    assert.match(html, /macro-chip active" data-macro-filter="Alimentação"/);
    assert.equal((html.match(/macro-chip-icon/g) || []).length, 7);
    assert.match(renderMacroChipsHtml('all'), /macro-chip active" data-macro-filter="all"/);
  });

  it('chips de subgrupo: só existem com um grupo escolhido e filtram as categorias certas', () => {
    const tree = buildCategoryTree(defaults());
    assert.equal(renderMicroChipsHtml(tree, 'all', 'all'), '');
    const html = renderMicroChipsHtml(tree, 'Moradia & Contas', 'morad_contas');
    assert.equal((html.match(/data-micro-filter=/g) || []).length, 3, '"Tudo em" + 2 subgrupos');
    assert.match(html, /micro-chip active" data-micro-filter="morad_contas"/);
    assert.ok(html.includes('Tudo em Moradia &amp; Contas'));
    assert.deepEqual(getMicroCategoryNames(tree, 'Moradia & Contas', 'morad_contas').sort(), ['Energia', 'Internet', 'Água'].sort());
    assert.equal(getMicroCategoryNames(tree, 'Moradia & Contas', 'all'), null);
    assert.equal(getMicroCategoryNames(tree, 'Moradia & Contas', 'inexistente'), null);
  });

  it('gestão: 6 grupos, 23 linhas, exclusão só para personalizadas e tudo escapado', () => {
    const cats = defaults();
    cats.push({ id: 'cat_custom_1', name: 'Livros <b>', icon: 'study', color: '#42A5F5', macro_group: 'Formação & Carreira', isCustom: true, active: true });
    cats.push({ id: 'cat_old', name: 'Antiga', icon: 'tag', color: '#999999', macro_group: 'Alimentação', isCustom: true, active: false });
    const html = renderManageTreeHtml(buildCategoryTree(cats));
    assert.equal((html.match(/class="cat-macro(?: open)?"/g) || []).length, 6);
    assert.equal((html.match(/class="cat-manage-row/g) || []).length, 25);
    assert.equal((html.match(/data-delete-cat="/g) || []).length, 1, 'só a personalizada ativa tem excluir');
    assert.match(html, /data-delete-cat="cat_custom_1"/);
    assert.ok(html.includes('Arquivada') && html.includes('Canônica'));
    assert.ok(!html.includes('Livros <b>'), 'nome deve ser escapado');
    assert.equal((html.match(/class="cat-macro open"/g) || []).length, 1, 'primeiro grupo aberto');
  });

  it('escolha de grupo: 6 radios com ícone, um marcado e valor igual ao nome do grupo', () => {
    const html = renderMacroRadiosHtml();
    assert.equal((html.match(/type="radio" name="macro_group"/g) || []).length, 6);
    assert.equal((html.match(/ checked/g) || []).length, 1);
    for (const m of MACRO_GROUPS) assert.ok(html.includes(`value="${m.name.replace('&', '&amp;')}"`), m.name);
    assert.match(renderMacroRadiosHtml('Saúde & Autocuidado'), /value="Saúde &amp; Autocuidado" checked/);
    assert.match(renderMacroRadiosHtml('inexistente'), /value="Alimentação" checked/);
  });
});