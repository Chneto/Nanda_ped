/**
 * Finanças Pediatria /v8/ - Suíte Oficial de Testes E2E no Navegador
 * Emulação iPhone 16 Plus (430x932, Mobile Safari, Touch Events)
 * Validando Cenários 1 a 9 com Playwright
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestServer } from './test_server.js';
import { probeContrast, probeSmallTargets } from './a11y_probe.js';

let chromium = null;
let devices = null;
try {
  const pw = await import('playwright');
  chromium = pw.chromium;
  devices = pw.devices;
} catch (e) {
  // Playwright é opcional localmente, mas obrigatório no CI (REQUIRE_E2E=1): nunca "passar" ignorando o E2E
  if (process.env.REQUIRE_E2E === '1') {
    throw new Error(`REQUIRE_E2E=1 mas o Playwright não pôde ser carregado: ${e.message}`);
  }
}

const TEST_PORT = 3389;
const APP_URL = `http://localhost:${TEST_PORT}/v8/index.html`;

describe('Finanças Pediatria /v8/ — Validação E2E no Navegador (iPhone 16 Plus)', { skip: !chromium }, () => {
  let server;
  let browser;
  let context;
  let page;
  const consoleErrors = [];
  const networkRequests = [];

  before(async () => {
    // 1. Inicia servidor estático local
    server = createTestServer(TEST_PORT);
    await new Promise((resolve) => server.listen(TEST_PORT, resolve));

    // 2. Inicializa Playwright Chromium emulando iPhone 16 Plus (usando canal Chrome do sistema)
    try {
      browser = await chromium.launch({ channel: 'chrome', headless: true });
    } catch (e) {
      try {
        browser = await chromium.launch({ channel: 'msedge', headless: true });
      } catch (e2) {
        browser = await chromium.launch({ headless: true });
      }
    }
    context = await browser.newContext({
      viewport: { width: 430, height: 932 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
    });

    page = await context.newPage();

    // Monitora erros no console e requisições de rede
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('request', (req) => {
      networkRequests.push({ url: req.url(), method: req.method() });
    });

    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
  });

  after(async () => {
    if (browser) await browser.close();
    if (server) await new Promise((resolve) => server.close(resolve));
  });

  // =========================================================================
  // CENÁRIO 1: ABERTURA DIRETA NA TELA "INÍCIO" EM 0MS SEM LOGIN
  // =========================================================================
  it('Cenário 1: Abertura direta instantânea na tela Início sem tela de login ou modal de credencial', async () => {
    const state = await page.evaluate(() => {
      const homeView = document.getElementById('view-home');
      const loginModal = document.querySelector('.login-modal, #modal-login, .auth-screen');
      const mainApp = document.getElementById('main-app-screen');
      const greeting = document.getElementById('header-doctor-name')?.textContent;
      const title = document.title;
      const appCreator = window.v8App?.creator;

      return {
        homeActive: homeView?.classList.contains('active'),
        homeHidden: homeView?.classList.contains('hidden'),
        loginModalPresent: Boolean(loginModal),
        mainAppVisible: Boolean(mainApp && window.getComputedStyle(mainApp).display !== 'none'),
        greeting,
        title,
        appCreator
      };
    });

    assert.equal(state.homeActive, true, 'Aba Início deve estar ativa');
    assert.equal(state.homeHidden, false, 'Aba Início não pode estar oculta');
    assert.equal(state.loginModalPresent, false, 'Não deve existir tela de login ou autenticação');
    assert.equal(state.mainAppVisible, true, 'Painel principal deve estar desimpedido');
    assert.equal(state.greeting, 'Médica', 'Saudação deve ser para a Médica');
    assert.equal(state.appCreator, 'FChNeto', 'Autor canônico deve ser FChNeto');
  });

  // =========================================================================
  // CENÁRIO 2: GERENCIAMENTO DINÂMICO NO MENU HAMBÚRGUER (FONTE & CATEGORIA)
  // =========================================================================
  it('Cenário 2: Adiciona nova fonte de renda médica e nova categoria de despesa via drawer', async () => {
    // 1. Abre gaveta do menu hambúrguer
    await page.locator('#btn-header-menu').click();
    const drawerOpen = await page.evaluate(() => {
      const drawer = document.getElementById('drawer-menu');
      return !drawer.classList.contains('hidden');
    });
    assert.equal(drawerOpen, true, 'Menu hambúrguer deve abrir');

    // 2. Navega para Gestão de Fontes de Renda
    await page.locator('#drawer-item-income-sources').click();
    const sourcesModalOpen = await page.evaluate(() => {
      return !document.getElementById('modal-income-sources').classList.contains('hidden');
    });
    assert.equal(sourcesModalOpen, true, 'Modal de Fontes de Renda deve abrir');

    // 3. Cadastra nova fonte: "Hospital da Criança", R$ 2.200,00, Sala de Parto (75% D+60 / 25% D+90)
    await page.evaluate(() => {
      const form = document.getElementById('form-add-income-source');
      form.querySelector('input[name="name"]').value = 'Hospital da Criança';
      form.querySelector('select[name="type"]').value = 'plantao';
      form.querySelector('input[name="defaultAmount"]').value = '2200';
      form.querySelector('select[name="paymentRuleType"]').value = 'parturition_75_60_25_90';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    // 4. Fecha modal de fontes e abre modal de categorias
    await page.evaluate(() => {
      window.v8App.ui.closeModal('#modal-income-sources');
      window.v8App.ui.openCategoriesModal();
    });

    // 5. Cadastra nova categoria: "Livros Médicos", macro "Formação & Carreira", teto 500
    await page.evaluate(() => {
      const form = document.getElementById('form-add-category');
      form.querySelector('input[name="name"]').value = 'Livros Médicos';
      form.querySelector('input[name="macro_group"][value="Formação & Carreira"]').checked = true; // escolha visual do grupo (radios)
      form.querySelector('input[name="monthly_budget_cap"]').value = '500';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    // 6. Fecha modal de categorias
    await page.evaluate(() => {
      window.v8App.ui.closeModal('#modal-categories');
    });

    // Verificação no Store
    const res = await page.evaluate(() => {
      const sources = window.v8App.store.getAllIncomeSources();
      const cats = window.v8App.store.getActiveCategories();
      const newSource = sources.find(s => s.name === 'Hospital da Criança');
      const newCat = cats.find(c => c.name === 'Livros Médicos');

      return {
        hasSource: Boolean(newSource),
        sourceDefaultAmount: newSource?.defaultAmount,
        sourceRule: newSource?.paymentRule?.type,
        hasCat: Boolean(newCat),
        catMacro: newCat?.macro_group,
        catBudget: newCat?.monthly_budget_cap
      };
    });

    assert.equal(res.hasSource, true, 'Hospital da Criança deve ter sido adicionado');
    assert.equal(res.sourceDefaultAmount, 2200, 'Valor padrão deve ser 2200');
    assert.equal(res.sourceRule, 'parturition_75_60_25_90', 'Regra deve ser Sala de Parto');
    assert.equal(res.hasCat, true, 'Livros Médicos deve ter sido adicionada');
    assert.equal(res.catMacro, 'Formação & Carreira', 'Macro-grupo deve ser Formação & Carreira');
    assert.equal(res.catBudget, 500, 'Teto deve ser 500');
  });

  // =========================================================================
  // CENÁRIO 3: REATIVIDADE INSTANTÂNEA NOS SELETORES E CHIPS SEM RELOAD
  // =========================================================================
  it('Cenário 3: Nova fonte e categoria surgem imediatamente nos seletores e chips sem recarregar a tela', async () => {
    const reactivity = await page.evaluate(() => {
      // 1. Chip rápido na barra do topo da Home
      const topChips = Array.from(document.querySelectorAll('.hospital-chip')).map(c => c.textContent.trim());
      const foundInTopChips = topChips.some(t => t.includes('Hospital da Criança'));

      // 2. Chip rápido dentro do modal de novo plantão
      window.v8App.ui.openShiftModal();
      const shiftChips = Array.from(document.querySelectorAll('#shift-source-chips-container [data-source-chip]')).map(c => c.getAttribute('data-source-chip'));
      const foundInShiftModalChips = shiftChips.includes('Hospital da Criança');
      window.v8App.ui.closeModal('#modal-shift');

      // 3. Select e chips dentro do modal de nova despesa
      window.v8App.ui.openExpenseModal();
      const expSelect = document.getElementById('exp-category-input');
      const expSelectOptions = Array.from(expSelect.options).map(o => o.value);
      const foundInExpSelect = expSelectOptions.includes('Livros Médicos');
      window.v8App.ui.closeModal('#modal-expense');

      return {
        foundInTopChips,
        foundInShiftModalChips,
        foundInExpSelect,
        totalCategoriesCount: expSelectOptions.length
      };
    });

    assert.equal(reactivity.foundInTopChips, true, 'Hospital da Criança deve aparecer no chip rápido da Home');
    assert.equal(reactivity.foundInShiftModalChips, true, 'Hospital da Criança deve aparecer nos chips do modal de plantão');
    assert.equal(reactivity.foundInExpSelect, true, 'Livros Médicos deve aparecer no select do modal de despesa');
    assert.equal(reactivity.totalCategoriesCount, 24, 'Deve conter 24 categorias ativas (23 canônicas + 1 nova)');
  });

  // =========================================================================
  // CENÁRIO 4: REGISTRO DE PLANTÃO VIA QUICK CHIP EM 1 TOQUE (75/25 D+60/D+90)
  // =========================================================================
  it('Cenário 4: Registro de plantão via quick chip em 1 toque com preenchimento automático e 75/25', async () => {
    // 1. Toca no chip rápido do Hospital da Criança
    await page.locator('[data-quick-hospital="Hospital da Criança"]').click();

    // 2. Verifica se o modal abriu com valor e hospital pré-preenchidos
    const prefilled = await page.evaluate(() => {
      const modal = document.getElementById('modal-shift');
      const form = document.getElementById('form-new-shift');
      return {
        modalVisible: !modal.classList.contains('hidden'),
        hospitalValue: form.querySelector('#shift-hospital-input')?.value,
        netValue: form.querySelector('#shift-net-input')?.value
      };
    });

    assert.equal(prefilled.modalVisible, true, 'Modal de plantão deve abrir');
    assert.equal(prefilled.hospitalValue, 'Hospital da Criança', 'Hospital deve ser pré-preenchido');
    assert.equal(prefilled.netValue, '2200', 'Valor líquido padrão deve ser R$ 2.200,00');

    // 3. Submete o formulário
    await page.locator('#form-new-shift button[type="submit"]').click();

    // 4. Confirma a criação do plantão e das parcelas 75% D+60 e 25% D+90
    const shiftState = await page.evaluate(() => {
      const shift = window.v8App.store.data.shifts.find(s => s.source_name_snapshot === 'Hospital da Criança');
      return {
        exists: Boolean(shift),
        netValue: shift?.net_value,
        installmentsCount: shift?.installments?.length,
        inst1Value: shift?.installments?.[0]?.value,
        inst1Percentage: shift?.installments?.[0]?.percentage,
        inst2Value: shift?.installments?.[1]?.value,
        inst2Percentage: shift?.installments?.[1]?.percentage
      };
    });

    assert.equal(shiftState.exists, true, 'Plantão deve existir no store');
    assert.equal(shiftState.netValue, 2200, 'Valor do plantão deve ser 2200');
    assert.equal(shiftState.installmentsCount, 2, 'Deve gerar exatamente 2 parcelas');
    assert.equal(shiftState.inst1Percentage, 75, 'Primeira parcela deve ser 75% (D+60)');
    assert.equal(shiftState.inst1Value, 1650, '75% de 2200 deve ser R$ 1.650,00');
    assert.equal(shiftState.inst2Percentage, 25, 'Segunda parcela deve ser 25% (D+90)');
    assert.equal(shiftState.inst2Value, 550, '25% de 2200 deve ser R$ 550,00');
  });

  // =========================================================================
  // CENÁRIO 5: EDIÇÃO DE LANÇAMENTO DIRETAMENTE NA LISTA COM 1 TOQUE
  // =========================================================================
  it('Cenário 5: Edição de lançamento diretamente na lista com 1 toque abrindo modal pré-preenchido', async () => {
    // 1. Alterna para Regime de Competência para ver o plantão na lista de produção do mês
    await page.locator('button[data-regime="competencia"]').click();

    // 2. Navega para a Aba Ganhos
    await page.locator('#tab-nav-income').click();

    // 3. Toca no card do plantão salvo (no título do hospital, longe dos botões das parcelas)
    await page.locator('[data-shift-card-id] .shift-hospital-title').first().click();

    // 4. Verifica se o modal abriu em modo de edição
    const editModal = await page.evaluate(() => {
      const modal = document.getElementById('modal-shift');
      const title = document.getElementById('modal-shift-title')?.textContent;
      const form = document.getElementById('form-new-shift');
      return {
        isOpen: !modal.classList.contains('hidden'),
        title,
        netValue: form.querySelector('#shift-net-input')?.value
      };
    });

    assert.equal(editModal.isOpen, true, 'Modal de edição deve abrir');
    assert.equal(editModal.title, 'Editar Plantão Pediátrico', 'Título deve indicar edição');
    assert.equal(editModal.netValue, '2200', 'Valor pré-preenchido deve ser 2200');

    // 5. Modifica o valor para 2400 e adiciona notas clínicas
    await page.evaluate(() => {
      const form = document.getElementById('form-new-shift');
      form.querySelector('#shift-net-input').value = '2400';
      form.querySelector('#shift-notes-input').value = 'Plantão Gemelar de Alto Risco';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    // 6. Confirma que os dados foram atualizados in-place
    const updated = await page.evaluate(() => {
      const shift = window.v8App.store.data.shifts[0];
      return {
        netValue: shift.net_value,
        notes: shift.notes,
        inst1Val: shift.installments[0].value,
        inst2Val: shift.installments[1].value
      };
    });

    assert.equal(updated.netValue, 2400, 'Valor atualizado deve ser 2400');
    assert.equal(updated.notes, 'Plantão Gemelar de Alto Risco', 'Notas devem ser atualizadas');
    assert.equal(updated.inst1Val, 1800, 'Parcela 1 (75%) deve ser reajustada para 1800');
    assert.equal(updated.inst2Val, 600, 'Parcela 2 (25%) deve ser reajustada para 600');
  });

  // =========================================================================
  // CENÁRIO 6: EXCLUSÃO COM TOAST E BOTÃO "DESFAZER / UNDO"
  // =========================================================================
  it('Cenário 6: Exclusão com Toast e acionamento do botão Desfazer / Undo revertendo a exclusão', async () => {
    // 1. Adiciona uma despesa para teste de exclusão
    const exp = await page.evaluate(() => {
      const e = window.v8App.store.addExpense({
        description: 'Estetoscópio Littmann Pediátrico',
        amount: 850.00,
        category: 'Livros Médicos',
        date: new Date().toISOString().slice(0, 10)
      });
      window.v8App.ui.render();
      return e;
    });

    // 2. Navega para a aba de despesas
    await page.locator('#tab-nav-expenses').click();

    // 3. Executa exclusão com registro de Toast de Undo
    const deleteState = await page.evaluate((expId) => {
      const deleted = window.v8App.store.deleteExpense(expId);
      window.v8App.ui.showToastWithUndo(`Despesa "${deleted.description}" excluída`, () => {
        window.v8App.store.restoreExpense(deleted);
        window.v8App.ui.render();
      });
      window.v8App.ui.render();

      const toast = document.querySelector('.toast-silk.toast-undo');
      const undoBtn = toast ? toast.querySelector('.btn-toast-undo') : null;
      const countRemaining = window.v8App.store.data.expenses.length;

      return {
        hasToast: Boolean(toast),
        hasUndoBtn: Boolean(undoBtn),
        countRemaining
      };
    }, exp.id);

    assert.equal(deleteState.hasToast, true, 'Toast com Desfazer deve ser renderizado');
    assert.equal(deleteState.hasUndoBtn, true, 'Botão Desfazer deve estar presente no Toast');
    assert.equal(deleteState.countRemaining, 0, 'Despesa deve ser removida da lista temporariamente');

    // 4. Clica no botão Desfazer do Toast
    await page.locator('.btn-toast-undo').click();

    // 5. Verifica se a despesa foi restaurada com sucesso
    const restored = await page.evaluate((expId) => {
      const item = window.v8App.store.data.expenses.find(e => e.id === expId);
      return {
        found: Boolean(item),
        desc: item?.description,
        amt: item?.amount
      };
    }, exp.id);

    assert.equal(restored.found, true, 'Despesa deve ter sido restaurada com sucesso pelo botão Desfazer');
    assert.equal(restored.desc, 'Estetoscópio Littmann Pediátrico', 'Descrição restaurada deve coincidir');
    assert.equal(restored.amt, 850, 'Valor restaurado deve coincidir');
  });

  // =========================================================================
  // CENÁRIO 7: PERSISTÊNCIA TRIPLA APÓS RECARREGAMENTO DA PÁGINA (F5)
  // =========================================================================
  it('Cenário 7: Persistência tripla após recarregamento (F5) no IndexedDB e localStorage', async () => {
    // 1. Executa recarregamento completo da página (F5)
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    // 2. Valida persistência íntegra de fontes, categorias, plantões e despesas
    const persisted = await page.evaluate(() => {
      const sources = window.v8App.store.getAllIncomeSources();
      const cats = window.v8App.store.getActiveCategories();
      const shifts = window.v8App.store.data.shifts;
      const expenses = window.v8App.store.data.expenses;

      return {
        hasHospitalDaCrianca: sources.some(s => s.name === 'Hospital da Criança'),
        hasLivrosMedicos: cats.some(c => c.name === 'Livros Médicos'),
        shiftsCount: shifts.length,
        shiftHosp: shifts[0]?.source_name_snapshot,
        shiftNet: shifts[0]?.net_value,
        shiftNotes: shifts[0]?.notes,
        expensesCount: expenses.length,
        expenseDesc: expenses[0]?.description,
        expenseAmt: expenses[0]?.amount
      };
    });

    assert.equal(persisted.hasHospitalDaCrianca, true, 'Fonte Hospital da Criança deve persistir após F5');
    assert.equal(persisted.hasLivrosMedicos, true, 'Categoria Livros Médicos deve persistir após F5');
    assert.equal(persisted.shiftsCount, 1, 'Plantão deve persistir após F5');
    assert.equal(persisted.shiftHosp, 'Hospital da Criança', 'Nome da fonte no plantão persistido');
    assert.equal(persisted.shiftNet, 2400, 'Valor de 2400 persistido');
    assert.equal(persisted.shiftNotes, 'Plantão Gemelar de Alto Risco', 'Notas clínicas persistidas');
    assert.equal(persisted.expensesCount, 1, 'Despesa deve persistir após F5');
    assert.equal(persisted.expenseDesc, 'Estetoscópio Littmann Pediátrico', 'Descrição da despesa persistida');
    assert.equal(persisted.expenseAmt, 850, 'Valor da despesa persistido');
  });

  // =========================================================================
  // CENÁRIO 8: IMPORTAÇÃO E EXPORTAÇÃO DE BACKUP JSON (LEGADO & V8)
  // =========================================================================
  it('Cenário 8: Importação e exportação de backup JSON (restauração de backup legado e backup v8)', async () => {
    const backupRoundtrip = await page.evaluate(() => {
      // 1. Exporta estado v8 atual
      const v8BackupJson = JSON.stringify({
        app: 'Finanças Pediatria',
        version: '8.0.0',
        creator: 'FChNeto',
        exportedAt: new Date().toISOString(),
        ...window.v8App.store.data
      });

      // 2. Prepara backup legado v2
      const legacyBackupJson = JSON.stringify({
        app: 'Finanças Pediatria',
        version: '2.0.0',
        author: 'FChNeto',
        timestamp: '2025-05-10T12:00:00.000Z',
        doctorName: 'Dra. Fernanda',
        doctorRole: 'Pediatra R2',
        shifts: [
          {
            id: 'legacy_shift_001',
            hospital: 'Maternidade Promater',
            date: '2025-05-02',
            shiftType: 'Sala de Parto',
            netValue: 1500,
            grossValue: 1500,
            notes: 'Plantão legado v2'
          }
        ],
        expenses: [
          {
            id: 'legacy_exp_001',
            description: 'Livro Pediatria Ambulatorial',
            amount: 220,
            date: '2025-05-03',
            category: 'Estudo'
          }
        ]
      });

      // 3. Importa backup legado
      const legacyRes = window.v8App.storage.importBackup(legacyBackupJson, window.v8App.store);
      const shiftsAfterLegacy = window.v8App.store.data.shifts.length;
      const expensesAfterLegacy = window.v8App.store.data.expenses.length;
      const legacyShiftHosp = window.v8App.store.data.shifts[0]?.source_name_snapshot;

      // 4. Restaura o backup v8
      const v8Res = window.v8App.storage.importBackup(v8BackupJson, window.v8App.store);
      const shiftsAfterV8 = window.v8App.store.data.shifts.length;
      const expensesAfterV8 = window.v8App.store.data.expenses.length;
      const v8ShiftHosp = window.v8App.store.data.shifts[0]?.source_name_snapshot;
      const v8ExpDesc = window.v8App.store.data.expenses[0]?.description;
      const hasCustomCat = window.v8App.store.getActiveCategories().some(c => c.name === 'Livros Médicos');
      const hasCustomSource = window.v8App.store.getAllIncomeSources().some(s => s.name === 'Hospital da Criança');

      return {
        legacySuccess: legacyRes.success,
        shiftsAfterLegacy,
        expensesAfterLegacy,
        legacyShiftHosp,
        v8Success: v8Res.success,
        shiftsAfterV8,
        expensesAfterV8,
        v8ShiftHosp,
        v8ExpDesc,
        hasCustomCat,
        hasCustomSource
      };
    });

    assert.equal(backupRoundtrip.legacySuccess, true, 'Importação de backup legado v2 deve ter sucesso');
    assert.equal(backupRoundtrip.shiftsAfterLegacy, 1, 'Deve recuperar 1 plantão legado');
    assert.equal(backupRoundtrip.expensesAfterLegacy, 1, 'Deve recuperar 1 despesa legada');
    assert.equal(backupRoundtrip.legacyShiftHosp, 'Maternidade Promater', 'Hospital legado deve ser mapeado');

    assert.equal(backupRoundtrip.v8Success, true, 'Restauração de backup v8 deve ter sucesso');
    assert.equal(backupRoundtrip.shiftsAfterV8, 1, 'Deve restaurar plantão v8');
    assert.equal(backupRoundtrip.v8ShiftHosp, 'Hospital da Criança', 'Hospital da Criança deve ser restaurado');
    assert.equal(backupRoundtrip.v8ExpDesc, 'Estetoscópio Littmann Pediátrico', 'Despesa v8 deve ser restaurada');
    assert.equal(backupRoundtrip.hasCustomCat, true, 'Categoria customizada deve ser restaurada');
    assert.equal(backupRoundtrip.hasCustomSource, true, 'Fonte customizada deve ser restaurada');
  });

  // =========================================================================
  // CENÁRIO 8b: SELETOR DE CATEGORIA EM GRUPOS (MACRO) E SUBGRUPOS (MICRO)
  // =========================================================================
  it('Cenário 8b: Seletor de categoria agrupado (macro > micro) com busca, sanfona e salvamento', async () => {
    await page.evaluate(() => window.v8App.ui.openExpenseModal());
    await page.click('#exp-category-trigger');
    assert.equal(await page.locator('#exp-category-trigger').getAttribute('aria-expanded'), 'true');

    // 6 grupos (macro) e apenas um aberto (sanfona)
    assert.equal(await page.locator('.cat-macro').count(), 6, 'Deve exibir os 6 grupos');
    assert.equal(await page.locator('.cat-macro.open').count(), 1, 'Somente o grupo da categoria atual abre');
    assert.ok(await page.locator('.cat-sub-title:visible').count() >= 2, 'Subgrupos (micro) visíveis dentro do grupo aberto');

    // Abrir outro grupo recolhe o anterior; escolher categoria fecha a lista e atualiza o botão
    await page.click('[data-macro="macro_moradia"] .cat-macro-head');
    assert.equal(await page.locator('.cat-macro.open').count(), 1);
    await page.click('[data-cat-pick="Energia"]');
    const picked = await page.evaluate(() => ({
      value: document.getElementById('exp-category-input').value,
      trigger: document.getElementById('exp-category-trigger').innerText.replace(/\s+/g, ' ').trim(),
      panelHidden: document.getElementById('exp-category-panel').classList.contains('hidden')
    }));
    assert.equal(picked.value, 'Energia');
    assert.ok(picked.trigger.includes('Energia') && picked.trigger.includes('Moradia & Contas'));
    assert.equal(picked.panelHidden, true);

    // Busca sem acento encontra a categoria e mostra apenas o grupo correspondente
    await page.click('#exp-category-trigger');
    await page.fill('#exp-cat-search', 'agua');
    assert.equal(await page.locator('.cat-tile').count(), 1);
    await page.fill('#exp-cat-search', 'zzzz');
    assert.equal(await page.locator('#exp-cat-empty').isVisible(), true, 'Mensagem amigável quando nada é encontrado');
    await page.fill('#exp-cat-search', '');

    // Salva a despesa com a categoria escolhida e classifica no macro-grupo correto
    await page.click('#exp-category-trigger');
    await page.fill('#exp-desc-input', 'Conta de luz E2E');
    await page.fill('#exp-amount-input', '98.76');
    await page.click('#form-new-expense button[type="submit"]');
    const saved = await page.evaluate(() => {
      const e = window.v8App.store.data.expenses.find(x => x.description === 'Conta de luz E2E');
      return { cat: e?.category_name_snapshot, macro: e?.macro_group_snapshot, amount: e?.amount };
    });
    assert.deepEqual(saved, { cat: 'Energia', macro: 'Moradia & Contas', amount: 98.76 });
  });

  // =========================================================================
  // CENÁRIO 8c: FILTRO POR GRUPO/SUBGRUPO E GESTÃO DE CATEGORIAS AGRUPADA
  // =========================================================================
  it('Cenário 8c: Filtro por grupo e subgrupo na aba Despesas e gestão agrupada de categorias', async () => {
    await page.evaluate(() => {
      const s = window.v8App.store;
      const d = new Date().toISOString().slice(0, 10);
      window.v8App.ui.closeAllModals();
      s.data.preferences.activeMonth = d.slice(0, 7);
      for (const [desc, cat, amt] of [['Feira 8c', 'Mercantil', 100], ['Almoço 8c', 'Refeição', 40], ['Pizza 8c', 'Delivery', 60], ['Gasolina 8c', 'Combustível', 200]]) {
        s.addExpense({ description: desc, category: cat, amount: amt, date: d });
      }
      window.v8App.ui.render();
    });
    await page.click('[data-tab="expenses"]');

    const visible = async () => (await page.locator('#expenses-list-container').innerText()).replace(/\s+/g, ' ');
    assert.equal(await page.locator('#micro-filter-bar').isVisible(), false, 'Subgrupos só aparecem com um grupo escolhido');

    await page.click('[data-macro-filter="Alimentação"]');
    assert.equal(await page.locator('#micro-filter-bar').isVisible(), true);
    let text = await visible();
    assert.ok(text.includes('Feira 8c') && text.includes('Pizza 8c') && !text.includes('Gasolina 8c'), 'Grupo Alimentação filtra as despesas');

    await page.click('[data-micro-filter="alim_prontas"]');
    text = await visible();
    assert.ok(text.includes('Almoço 8c') && text.includes('Pizza 8c') && !text.includes('Feira 8c'), 'Subgrupo "Refeições prontas" filtra Refeição e Delivery');

    // Trocar de grupo zera o subgrupo; "Todas" limpa tudo
    await page.click('[data-macro-filter="Transporte & Mobilidade"]');
    text = await visible();
    assert.ok(text.includes('Gasolina 8c') && !text.includes('Pizza 8c'));
    await page.click('[data-macro-filter="all"]');
    assert.equal(await page.locator('#micro-filter-bar').isVisible(), false);

    // Gestão de categorias: grupos em sanfona, ícones e escolha visual do grupo
    await page.evaluate(() => window.v8App.ui.openCategoriesModal());
    assert.equal(await page.locator('#categories-modal-body .cat-macro').count(), 6);
    assert.equal(await page.locator('#categories-modal-body .cat-macro.open').count(), 1);
    await page.click('#categories-modal-body [data-macro="macro_saude"] .cat-macro-head');
    assert.equal(await page.locator('#categories-modal-body .cat-macro.open').count(), 1, 'Sanfona: um grupo aberto por vez');
    assert.equal(await page.locator('#categories-modal-body [data-macro="macro_saude"] .cat-manage-row').count(), 5);
    assert.equal(await page.locator('.macro-radio').count(), 6);

    await page.fill('#form-add-category [name="name"]', 'Livros 8c');
    await page.locator('.macro-radio', { hasText: 'Formação' }).click();
    await page.click('#form-add-category button[type="submit"]');
    const created = await page.evaluate(() => window.v8App.store.data.categories.find(c => c.name === 'Livros 8c')?.macro_group);
    assert.equal(created, 'Formação & Carreira');

    // Títulos mostram a contagem real (não mais "23" fixo)
    await page.evaluate(() => window.v8App.ui.openCategoriesModal());
    const counts = await page.evaluate(() => {
      const cats = window.v8App.store.data.categories;
      return {
        active: cats.filter(c => c.active !== false).length,
        custom: cats.filter(c => c.isCustom && c.active !== false).length,
        title: document.getElementById('modal-categories-title').textContent,
        summary: document.querySelector('#categories-modal-body .management-toolbar h4').textContent
      };
    });
    assert.ok(counts.custom >= 1);
    assert.equal(counts.title, `${counts.active} Categorias de Gastos`);
    assert.ok(counts.summary.startsWith(`${counts.active} categorias`), counts.summary);
    assert.ok(counts.summary.includes(`${counts.custom} criada`), counts.summary);
    // Reabrir o modal várias vezes não duplica ações (um único listener)
    await page.evaluate(() => { window.v8App.ui.openCategoriesModal(); window.v8App.ui.openCategoriesModal(); });
    await page.click('#btn-restore-categories');
    const restoredToasts = await page.locator('.toast-silk', { hasText: 'restauradas' }).count();
    assert.equal(restoredToasts, 1, 'Restaurar deve disparar uma única vez');
    await page.evaluate(() => window.v8App.ui.closeAllModals());
  });
  // =========================================================================
  // CENÁRIO 8d: GANHOS DO MÊS, CARTÃO CAIXA × PRODUÇÃO E RESTAURAÇÃO SEGURA DE BACKUP
  // =========================================================================
  it('Cenário 8d: Plantão do mês aparece em Ganhos, cartão compara os dois regimes e restaurar backup pede confirmação e permite desfazer', async () => {
    // --- 1) Plantão do mês aparece no Regime de Caixa mesmo recebendo só em meses futuros
    await page.evaluate(() => {
      const s = window.v8App.store;
      window.v8App.ui.closeAllModals();
      s.data.shifts = [];
      s.data.expenses = [];
      const ym = new Date().toISOString().slice(0, 7);
      s.data.preferences.activeMonth = ym;
      s.data.preferences.regime = 'caixa';
      s.addShift({ hospital: 'Hospital 8d', net_value: 1000, date: `${ym}-03` });
      window.v8App.ui.render();
    });
    await page.click('[data-tab="income"]');
    const incomeText = (await page.locator('#shifts-list-container').innerText()).replace(/\s+/g, ' ');
    assert.ok(incomeText.includes('Hospital 8d'), 'Plantão trabalhado no mês deve aparecer em Ganhos (caixa)');
    assert.ok(incomeText.includes('Recebe a partir de'), 'Deve avisar quando o recebimento é em meses futuros');
    assert.ok(!incomeText.includes('Nenhum plantão registrado'));

    // --- 2) Cartão da Início calcula caixa E produção, independentemente do regime escolhido
    await page.click('[data-tab="home"]');
    const comp = async () => (await page.locator('#home-comparison-container').innerText()).replace(/\s+/g, ' ');
    let c = await comp();
    assert.ok(/Produção do mês[^R]*R\$\s*1\.000,00/.test(c), `Produção deve mostrar R$ 1.000,00 em regime de caixa: ${c}`);
    await page.evaluate(() => { window.v8App.store.data.preferences.regime = 'competencia'; window.v8App.ui.render(); });
    c = await comp();
    assert.ok(/Produção do mês[^R]*R\$\s*1\.000,00/.test(c), `Produção também em competência: ${c}`);
    await page.evaluate(() => { window.v8App.store.data.preferences.regime = 'caixa'; window.v8App.ui.render(); });

    // --- 3) Restaurar backup: confirmação, cancelar mantém dados, confirmar substitui, Desfazer devolve
    const backup = JSON.stringify({
      version: '7.0.0',
      exportedAt: '2026-10-01T12:00:00.000Z',
      shifts: [{ id: 'bk1', hospital: 'Hospital Backup', net_value: 3000, date: '2026-09-10' }],
      expenses: [{ id: 'bke1', description: 'Item do backup', category: 'Mercantil', amount: 50, date: '2026-09-11' }]
    });
    const file = { name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(backup) };
    const ids = () => page.evaluate(() => window.v8App.store.data.shifts.map(s => s.name || s.source_name_snapshot));

    await page.setInputFiles('#backup-file-input', file);
    await page.waitForSelector('#modal-confirm:not(.hidden)');
    const dialogText = (await page.locator('#modal-confirm').innerText()).replace(/\s+/g, ' ');
    assert.ok(dialogText.includes('1 plantão') && dialogText.includes('1 despesa'), 'Mostra o que o arquivo contém');
    assert.ok(dialogText.includes('serão substituídos'), 'Avisa que os dados atuais serão substituídos');
    assert.deepEqual(await ids(), ['Hospital 8d'], 'Nada muda antes de confirmar');

    await page.click('#modal-confirm [data-confirm="cancel"]');
    assert.equal(await page.locator('#modal-confirm').evaluate(el => el.classList.contains('hidden')), true);
    assert.deepEqual(await ids(), ['Hospital 8d'], 'Cancelar mantém os dados atuais');

    await page.setInputFiles('#backup-file-input', file);
    await page.waitForSelector('#modal-confirm:not(.hidden)');
    await page.click('#modal-confirm [data-confirm="ok"]');
    await page.waitForSelector('.toast-undo');
    assert.deepEqual(await ids(), ['Hospital Backup'], 'Confirmar substitui os dados');
    // Rede de segurança: cópia do estado anterior guardada no IndexedDB antes de restaurar
    const safety = await page.evaluate(() => new Promise((resolve, reject) => {
      const open = indexedDB.open('v8_pediatric_db', 1);
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const req = open.result.transaction('app_state', 'readonly').objectStore('app_state').get('pre_import_snapshot');
        req.onsuccess = () => resolve(req.result ? { names: (req.result.state.shifts || []).map(s => s.source_name_snapshot), savedAt: Boolean(req.result.savedAt) } : null);
        req.onerror = () => reject(req.error);
      };
    }));
    assert.deepEqual(safety?.names, ['Hospital 8d'], 'Cópia de segurança pré-restauração deve existir no IndexedDB');
    assert.equal(safety.savedAt, true);

    await page.click('.toast-undo .btn-toast-undo');
    assert.deepEqual(await ids(), ['Hospital 8d'], 'Desfazer devolve os dados anteriores');

    // Esc cancela o diálogo
    await page.setInputFiles('#backup-file-input', file);
    await page.waitForSelector('#modal-confirm:not(.hidden)');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#modal-confirm').evaluate(el => el.classList.contains('hidden')), true);
    assert.deepEqual(await ids(), ['Hospital 8d'], 'Esc cancela sem alterar dados');

    // Arquivo inválido: erro amigável e nenhum diálogo
    await page.setInputFiles('#backup-file-input', { name: 'ruim.json', mimeType: 'application/json', buffer: Buffer.from('{ quebrado') });
    await page.waitForSelector('.toast-silk.error');
    assert.equal(await page.locator('#modal-confirm').evaluate(el => el.classList.contains('hidden')), true);
    assert.deepEqual(await ids(), ['Hospital 8d']);
  });
  // =========================================================================
  // CENÁRIO 8e: EDIÇÃO DE PARCELA (DATA, VALOR, RECEBIMENTO REAL) COM DESFAZER
  // =========================================================================
  it('Cenário 8e: Editar parcela de plantão (data, valor, recebimento) atualiza a tela e permite desfazer', async () => {
    await page.evaluate(() => {
      const s = window.v8App.store;
      window.v8App.ui.closeAllModals();
      s.data.shifts = [];
      const ym = new Date().toISOString().slice(0, 7);
      s.data.preferences.activeMonth = ym;
      s.data.preferences.regime = 'caixa';
      s.addShift({ hospital: 'Hospital 8e', net_value: 2000, date: `${ym}-03` });
      window.v8App.ui.render();
    });
    const parcelas = () => page.evaluate(() => window.v8App.store.data.shifts[0].installments.map(i => [i.value, i.date, i.status, i.paidDate]));
    const original = await parcelas();

    await page.click('[data-tab="income"]');
    await page.locator('[data-edit-installment="1"]').first().click();
    assert.equal(await page.locator('#modal-installment').evaluate(el => el.classList.contains('hidden')), false, 'Abre o modal da parcela');
    assert.equal(await page.locator('#inst-paid-group').isVisible(), false, 'Data real só aparece quando Recebido');

    // Valor inválido: erro amigável, nada muda, modal continua aberto
    await page.fill('#inst-value-input', '0');
    await page.click('#form-installment button[type="submit"]');
    await page.waitForSelector('.toast-silk.error');
    assert.deepEqual(await parcelas(), original, 'Valor inválido não altera dados');
    assert.equal(await page.locator('#modal-installment').evaluate(el => el.classList.contains('hidden')), false);

    // Edita valor (com ajuste da outra), data prevista e marca como recebido com data real
    await page.fill('#inst-value-input', '1200');
    await page.fill('#inst-date-input', '2027-02-05');
    await page.locator('.inst-status-option', { hasText: 'Recebido' }).click();
    assert.equal(await page.locator('#inst-paid-group').isVisible(), true);
    await page.fill('#inst-paid-input', '2027-02-06');
    await page.click('#form-installment button[type="submit"]');
    await page.waitForSelector('.toast-undo');

    const edited = await parcelas();
    assert.deepEqual(edited[0], [1200, '2027-02-05', 'received', '2027-02-06']);
    assert.equal(edited[1][0], 800, 'A outra parcela fecha o total');
    const cardText = (await page.locator('#shifts-list-container').innerText()).replace(/\s+/g, ' ');
    assert.ok(cardText.includes('1.200,00') && cardText.includes('Caiu em 06/02/2027'), 'Tela mostra valor e data real do recebimento');

    // Desfazer devolve tudo
    await page.click('.toast-undo .btn-toast-undo');
    assert.deepEqual(await parcelas(), original, 'Desfazer restaura as parcelas originais');

    // Esc fecha o modal sem salvar
    await page.locator('[data-edit-installment="2"]').first().click();
    await page.fill('#inst-value-input', '1');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#modal-installment').evaluate(el => el.classList.contains('hidden')), true);
    assert.deepEqual(await parcelas(), original);
  });
  // =========================================================================
  // CENÁRIO 8f: ACESSIBILIDADE REAL — contraste AA, alvos de 44 px, ARIA e movimento reduzido
  // =========================================================================
  it('Cenário 8f: Contraste AA em todas as telas (claro/escuro), alvos de toque >= 44 px, ARIA e movimento reduzido', async () => {
    await page.evaluate(() => {
      const s = window.v8App.store;
      window.v8App.ui.closeAllModals();
      const ym = new Date().toISOString().slice(0, 7);
      s.data.preferences.activeMonth = ym;
      s.data.preferences.regime = 'caixa';
      s.data.residencySalary = { value: 4000, dayOfMonth: 5, active: true, description: 'Bolsa' };
      s.data.shifts = [];
      s.addShift({ hospital: 'Hospital 8f', net_value: 2000, date: `${ym}-03` });
      s.data.shifts[0].installments[1].status = 'received';
      s.data.shifts[0].installments[1].paidDate = `${ym}-12`;
      s.addExpense({ description: 'Feira 8f', category: 'Mercantil', amount: 230, date: `${ym}-05` });
      window.v8App.ui.render();
    });

    const screens = [
      ['início', async () => { await page.evaluate(() => window.v8App.ui.closeAllModals()); await page.click('[data-tab="home"]'); }],
      ['ganhos', async () => { await page.click('[data-tab="income"]'); }],
      ['despesas', async () => { await page.click('[data-tab="expenses"]'); await page.click('[data-macro-filter="Alimentação"]'); }],
      ['menu', async () => { await page.evaluate(() => window.v8App.ui.openDrawer()); }],
      ['modal despesa', async () => { await page.evaluate(() => { window.v8App.ui.closeDrawer(); window.v8App.ui.openExpenseModal(); }); await page.click('#exp-category-trigger'); }],
      ['modal plantão', async () => { await page.evaluate(() => { window.v8App.ui.closeAllModals(); window.v8App.ui.openShiftModal(); }); }],
      ['modal parcela', async () => { await page.evaluate(() => { window.v8App.ui.closeAllModals(); window.v8App.ui.openInstallmentModal(window.v8App.store.data.shifts[0].id, 1); }); }],
      ['modal categorias', async () => { await page.evaluate(() => { window.v8App.ui.closeAllModals(); window.v8App.ui.openCategoriesModal(); }); }],
      ['tetos (início/despesas)', async () => { await page.evaluate(() => { window.v8App.ui.closeAllModals(); const s = window.v8App.store; const id = s.data.categories.find(c => c.name === 'Mercantil').id; s.setCategoryBudgetCap(id, 100); s.setCategoryBudgetCap(s.data.categories.find(c => c.name === 'Uber').id, 200); s.addExpense({ description: 'Teto A', category: 'Mercantil', amount: 150, date: new Date().toISOString().slice(0, 7) + '-07' }); s.addExpense({ description: 'Teto B', category: 'Uber', amount: 170, date: new Date().toISOString().slice(0, 7) + '-07' }); window.v8App.ui.render(); }); await page.click('[data-tab="home"]'); await page.click('[data-tab="expenses"]'); }],
      ['modal teto', async () => { await page.evaluate(() => { window.v8App.ui.closeAllModals(); window.v8App.ui.openCategoryCapModal(window.v8App.store.data.categories.find(c => c.name === 'Mercantil').id); }); }],
      ['modal relatório', async () => { await page.evaluate(() => { window.v8App.ui.closeAllModals(); window.v8App.ui.openReportModal(); }); }],
      ['modal fontes', async () => { await page.evaluate(() => { window.v8App.ui.closeAllModals(); window.v8App.ui.openIncomeSourcesModal(); }); }],
      ['modal perfil', async () => { await page.evaluate(() => { window.v8App.ui.closeAllModals(); window.v8App.ui.openProfileModal(); }); }]
    ];

    const contrastFails = [];
    const smallTargets = [];
    // Movimento reduzido durante a medição: sem transições em andamento, as cores lidas são as finais
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const theme of ['light', 'dark']) {
      await page.evaluate((th) => {
        document.querySelectorAll('.toast-silk').forEach(el => el.remove()); // avisos de cenários anteriores
        document.documentElement.setAttribute('data-theme', th);
        window.v8App.ui.render();
      }, theme);
      await page.waitForTimeout(50);
      for (const [name, go] of screens) {
        await go();
        for (const x of await page.evaluate(probeContrast)) {
          if (x.ratio < x.need) contrastFails.push(`${theme}/${name}: "${x.text}" (.${x.cls}) ${x.ratio} < ${x.need}`);
        }
        if (theme === 'light') {
          for (const x of await page.evaluate(probeSmallTargets)) smallTargets.push(`${name}: ${x.cls} "${x.text}" ${x.w}x${x.h}`);
        }
      }
    }
    await page.evaluate(() => { window.v8App.ui.closeAllModals(); window.v8App.ui.closeDrawer(); document.documentElement.setAttribute('data-theme', 'light'); window.v8App.ui.render(); });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    // Limpa os tetos criados só para a varredura (não vazar para os próximos cenários)
    await page.evaluate(() => {
      const s = window.v8App.store;
      s.data.expenses = s.data.expenses.filter(e => e.description !== 'Teto A' && e.description !== 'Teto B');
      for (const n of ['Mercantil', 'Uber']) s.setCategoryBudgetCap(s.data.categories.find(c => c.name === n).id, null);
      window.v8App.ui.render();
    });
    assert.deepEqual([...new Set(contrastFails)].slice(0, 12), [], 'Textos abaixo de AA (4,5:1; 3:1 para texto grande)');
    assert.deepEqual([...new Set(smallTargets)].slice(0, 12), [], 'Alvos de toque menores que 44 px');

    // ARIA de navegação e regime
    await page.click('[data-tab="income"]');
    assert.equal(await page.locator('#tab-nav-income').getAttribute('aria-current'), 'page');
    assert.equal(await page.locator('#tab-nav-home').getAttribute('aria-current'), null);
    await page.click('button[data-regime="competencia"]');
    assert.equal(await page.locator('button[data-regime="competencia"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('button[data-regime="caixa"]').getAttribute('aria-pressed'), 'false');
    await page.click('button[data-regime="caixa"]');
    assert.equal(await page.locator('#current-month-title').getAttribute('aria-live'), 'polite');

    // Campos de dinheiro abrem o teclado decimal
    await page.evaluate(() => window.v8App.ui.openExpenseModal());
    assert.equal(await page.locator('#exp-amount-input').getAttribute('inputmode'), 'decimal');
    await page.evaluate(() => window.v8App.ui.closeAllModals());

    // Movimento reduzido: transições/animações praticamente instantâneas
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const durations = await page.evaluate(() => ['.nav-tab', '.macro-chip', '.btn-silk-primary'].map((sel) => {
      const el = document.querySelector(sel);
      return el ? parseFloat(getComputedStyle(el).transitionDuration) : 0;
    }));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    assert.ok(durations.every((d) => d <= 0.001), `Transições devem ser desligadas com movimento reduzido: ${durations}`);
  });
  // =========================================================================
  // CENÁRIO 8g: TETOS MENSAIS POR CATEGORIA (aviso ao lançar, cartão, Início e edição do teto)
  // =========================================================================
  it('Cenário 8g: Tetos mensais — aviso ao lançar, cartão em Despesas, aviso na Início e edição com Desfazer', async () => {
    await page.evaluate(() => {
      const s = window.v8App.store;
      window.v8App.ui.closeAllModals();
      document.querySelectorAll('.toast-silk').forEach(el => el.remove());
      s.data.expenses = [];
      const ym = new Date().toISOString().slice(0, 7);
      s.data.preferences.activeMonth = ym;
      const id = (n) => s.data.categories.find(c => c.name === n).id;
      // Isola o cenário: remove os tetos criados por cenários anteriores (ex.: "Livros Médicos" tem teto de 500)
      for (const c of s.data.categories) s.setCategoryBudgetCap(c.id, null);
      s.setCategoryBudgetCap(id('Mercantil'), 300);
      s.setCategoryBudgetCap(id('Energia'), 200);
      s.addExpense({ description: 'Feira 8g', category: 'Mercantil', amount: 230, date: `${ym}-05` });
      s.addExpense({ description: 'Luz 8g', category: 'Energia', amount: 170, date: `${ym}-06` });
      window.v8App.ui.render();
    });

    // --- Início: aviso aparece (Energia a 85% = perto do teto)
    await page.click('[data-tab="home"]');
    let alertText = (await page.locator('#home-budget-alert').innerText()).replace(/\s+/g, ' ');
    assert.ok(alertText.includes('1 categoria perto do teto') && alertText.includes('Energia (85%)'), alertText);
    await page.click('#home-budget-alert [data-goto-tab="expenses"]');
    assert.equal(await page.locator('#view-expenses').evaluate(el => !el.classList.contains('hidden')), true, '"Ver tetos" leva para Despesas');

    // --- Despesas: cartão com barras acessíveis e estado em texto
    const card = (await page.locator('#budget-caps-container').innerText()).replace(/\s+/g, ' ');
    assert.ok(card.includes('Tetos do mês') && card.includes('Perto do teto') && card.includes('Dentro do teto'), card);
    assert.equal(await page.locator('#budget-caps-container [role="progressbar"]').count(), 2);
    assert.equal(await page.locator('#budget-caps-container [aria-label="Teto de Energia"]').getAttribute('aria-valuenow'), '85');

    // --- Lançar despesa: aviso muda conforme valor, categoria e parcelamento
    await page.evaluate(() => window.v8App.ui.openExpenseModal());
    await page.locator('#exp-category-trigger').click();
    await page.locator('[data-cat-pick="Mercantil"]').click();
    const hint = async () => (await page.locator('#exp-budget-hint').innerText()).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ');
    await page.fill('#exp-amount-input', '50');
    assert.ok((await hint()).includes('R$ 280,00 (93%)'), await hint());
    assert.ok(await page.locator('#exp-budget-hint').evaluate(el => el.classList.contains('warn')));
    await page.fill('#exp-amount-input', '100');
    assert.ok((await hint()).includes('R$ 30,00 acima do teto'), await hint());
    assert.ok(await page.locator('#exp-budget-hint').evaluate(el => el.classList.contains('over')));
    await page.selectOption('#exp-installments-input', '5');
    assert.ok((await hint()).includes('R$ 250,00 (83%)') && (await hint()).includes('1ª parcela'), 'Parcelado considera só a 1ª parcela: ' + await hint());
    await page.locator('#exp-category-trigger').click();
    await page.click('#exp-category-panel [data-macro="macro_saude"] .cat-macro-head'); // abre o grupo Saúde (sanfona)
    await page.locator('[data-cat-pick="Remédios"]').click();
    assert.equal(await page.locator('#exp-budget-hint').evaluate(el => el.classList.contains('hidden')), true, 'Categoria sem teto não mostra aviso');
    await page.evaluate(() => window.v8App.ui.closeAllModals());

    // --- Gestão de categorias: editar o teto de uma categoria padrão, com Desfazer
    await page.evaluate(() => window.v8App.ui.openCategoriesModal());
    const capBtn = page.locator('[data-edit-cap]:visible').first();
    assert.ok((await page.locator('#categories-modal-body').innerText()).replace(/\u00a0/g, ' ').includes('Teto R$ 300,00/mês'), 'Teto atual aparece na linha da categoria');
    await capBtn.click();
    assert.equal(await page.locator('#modal-category-cap').evaluate(el => el.classList.contains('hidden')), false);
    await page.fill('#cap-value-input', '-5');
    await page.click('#form-category-cap button[type="submit"]');
    await page.waitForSelector('.toast-silk.error');
    await page.fill('#cap-value-input', '500');
    await page.click('#form-category-cap button[type="submit"]');
    await page.waitForSelector('.toast-undo');
    const capOf = (n) => page.evaluate((name) => window.v8App.store.data.categories.find(c => c.name === name).monthly_budget_cap, n);
    assert.equal(await capOf('Mercantil'), 500);
    assert.equal(await page.locator('#modal-categories').evaluate(el => el.classList.contains('hidden')), false, 'Volta para a lista de categorias');
    await page.click('.toast-undo .btn-toast-undo');
    assert.equal(await capOf('Mercantil'), 300, 'Desfazer restaura o teto anterior');

    // Remover o teto (campo vazio) tira a categoria do cartão
    await page.locator('[data-edit-cap]:visible').first().click();
    await page.fill('#cap-value-input', '');
    await page.click('#form-category-cap button[type="submit"]');
    await page.waitForSelector('.toast-undo');
    assert.equal(await capOf('Mercantil'), null);
    await page.evaluate(() => window.v8App.ui.closeAllModals());
    await page.click('[data-tab="expenses"]');
    assert.equal(await page.locator('#budget-caps-container [aria-label="Teto de Mercantil"]').count(), 0);

    // Estado limpo para os próximos cenários
    await page.evaluate(() => {
      const s = window.v8App.store;
      s.setCategoryBudgetCap(s.data.categories.find(c => c.name === 'Energia').id, null);
      document.querySelectorAll('.toast-silk').forEach(el => el.remove());
      window.v8App.ui.render();
    });
  });
  // =========================================================================
  // CENÁRIO 8h: RELATÓRIO MENSAL (menu, pré-visualização, planilha CSV, impressão/PDF e compartilhamento)
  // =========================================================================
  it('Cenário 8h: Relatório mensal — pré-visualização, CSV (download e compartilhamento nativo) e impressão', async () => {
    await page.evaluate(() => {
      const s = window.v8App.store;
      window.v8App.ui.closeAllModals();
      document.querySelectorAll('.toast-silk').forEach(el => el.remove());
      const ym = new Date().toISOString().slice(0, 7);
      s.data.preferences.activeMonth = ym;
      s.data.preferences.regime = 'caixa';
      s.data.doctorName = 'Dra. Relatório';
      s.data.residencySalary = { value: 4000, dayOfMonth: 5, active: true, description: 'Bolsa' };
      s.data.shifts = []; s.data.expenses = [];
      for (const c of s.data.categories) s.setCategoryBudgetCap(c.id, null);
      s.addShift({ hospital: 'Hospital 8h', net_value: 2000, date: `${ym}-03` });
      s.addExpense({ description: 'Feira 8h', category: 'Mercantil', amount: 230, date: `${ym}-05` });
      s.addExpense({ description: '=1+1', category: 'Uber', amount: 45, date: `${ym}-06` });
      window.v8App.ui.render();
    });

    // Menu -> Relatório do Mês
    await page.evaluate(() => window.v8App.ui.openDrawer());
    await page.click('#drawer-item-report');
    assert.equal(await page.locator('#modal-report').evaluate(el => el.classList.contains('hidden')), false);
    const monthLabel = await page.evaluate(() => window.v8App.ui._report.monthLabel);
    assert.equal((await page.locator('#modal-report-title').innerText()).trim(), `Relatório de ${monthLabel}`);
    const preview = (await page.locator('#report-body').innerText()).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ');
    for (const piece of ['Resumo', 'Hospital 8h', 'Feira 8h', 'Total de despesas', 'R$ 275,00', 'Dra. Relatório']) assert.ok(preview.includes(piece), `pré-visualização sem "${piece}"`);
    assert.equal(await page.locator('#report-body table caption').count() >= 3, true, 'tabelas com legenda');

    // Planilha CSV: download real (Web Share indisponível)
    await page.evaluate(() => { navigator.canShare = () => false; });
    const [download] = await Promise.all([page.waitForEvent('download'), page.click('[data-action="report-csv"]')]);
    assert.match(download.suggestedFilename(), /^relatorio_financas_pediatria_\d{4}-\d{2}\.csv$/);
    const chunks = [];
    for await (const c of await download.createReadStream()) chunks.push(c);
    const raw = Buffer.concat(chunks);
    assert.deepEqual([...raw.subarray(0, 3)], [0xEF, 0xBB, 0xBF], 'BOM UTF-8 para o Excel reconhecer acentos');
    const csv = raw.toString('utf8').replace(/^\uFEFF/, '');
    assert.ok(csv.includes('Despesas do mês;275'), 'total de despesas na planilha');
    assert.ok(csv.includes("'=1+1"), 'fórmula digitada pela usuária é neutralizada');
    assert.ok(!/(^|;)=/m.test(csv), 'nenhuma célula começa com "="');
    await page.waitForSelector('.toast-silk:has-text("Planilha salva")');

    // Compartilhamento nativo (iPhone): usa navigator.share com um File CSV
    const shared = await page.evaluate(async () => {
      let received = null;
      navigator.canShare = (d) => Boolean(d && d.files && d.files.length);
      navigator.share = async (d) => { const f = d.files[0]; received = { name: f.name, type: f.type, text: await f.text() }; };
      await window.v8App.ui.exportReportCsv();
      return received;
    });
    assert.match(shared.name, /\.csv$/);
    assert.equal(shared.type, 'text/csv');
    assert.ok(shared.text.includes('RESUMO'));

    // Cancelar o compartilhamento não mostra erro
    const cancelToast = await page.evaluate(async () => {
      document.querySelectorAll('.toast-silk').forEach(el => el.remove());
      navigator.share = async () => { const e = new Error('cancelado'); e.name = 'AbortError'; throw e; };
      await window.v8App.ui.exportReportCsv();
      return document.querySelectorAll('.toast-silk.error').length;
    });
    assert.equal(cancelToast, 0, 'cancelar não deve gerar erro');

    // Impressão/PDF: monta a área de impressão, chama window.print e limpa ao terminar
    const printed = await page.evaluate(() => new Promise((resolve) => {
      window.print = () => {
        const root = document.getElementById('report-print-root');
        resolve({ filled: root.innerHTML.includes('Hospital 8h') });
        window.dispatchEvent(new Event('afterprint'));
      };
      window.v8App.ui.printReport();
    }));
    assert.equal(printed.filled, true, 'área de impressão preenchida no momento de imprimir');
    assert.equal(await page.evaluate(() => document.getElementById('report-print-root').innerHTML), '', 'área de impressão limpa depois');
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => { window.print = () => {}; window.v8App.ui.printReport(); });
    const printVisible = await page.evaluate(() => [...document.body.children].filter(el => getComputedStyle(el).display !== 'none').map(el => el.id));
    await page.emulateMedia({ media: 'screen' });
    assert.deepEqual(printVisible, ['report-print-root'], 'na impressão só o relatório aparece');

    // Esc fecha o modal
    await page.evaluate(() => { document.getElementById('report-print-root').innerHTML = ''; });
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#modal-report').evaluate(el => el.classList.contains('hidden')), true);
    await page.evaluate(() => { document.querySelectorAll('.toast-silk').forEach(el => el.remove()); });
  });
  // =========================================================================
  // CENÁRIO 8i: GRÁFICO CAIXA × COMPETÊNCIA NA INÍCIO
  // =========================================================================
  it('Cenário 8i: Cartão Caixa × Competência — gráfico acessível, tabela, frases e acompanha o mês', async () => {
    await page.evaluate(() => {
      const s = window.v8App.store;
      window.v8App.ui.closeAllModals();
      document.querySelectorAll('.toast-silk').forEach(el => el.remove());
      s.data.shifts = []; s.data.expenses = [];
      s.data.residencySalary = { value: 4000, dayOfMonth: 5, active: true, description: 'Bolsa' };
      s.data.preferences.activeMonth = '2026-11';
      s.data.preferences.regime = 'caixa';
      s.addShift({ hospital: 'Hospital 8i-A', net_value: 2000, date: '2026-06-10' }); // parcelas em ago/set: uma fica atrasada
      s.addShift({ hospital: 'Hospital 8i-B', net_value: 3000, date: '2026-11-03' }); // produção de novembro, caixa só em jan/fev
      window.v8App.ui.render();
    });
    await page.click('[data-tab="home"]');

    const card = page.locator('#cash-accrual-card');
    assert.equal(await card.isVisible(), true);
    assert.equal((await card.locator('h2').innerText()).trim(), 'Caixa × Competência');

    // Gráfico: imagem com título/descrição, 6 meses, 12 barras, mês atual destacado
    const svg = card.locator('svg.cac-svg');
    assert.equal(await svg.getAttribute('role'), 'img');
    assert.equal(await svg.locator('g.cac-group').count(), 6);
    assert.equal(await svg.locator('rect.cac-bar').count(), 12);
    assert.equal(await svg.locator('g.cac-group.active text').textContent(), 'Nov');
    const desc = (await svg.locator('desc').textContent()).replace(/\u00a0/g, ' ');
    assert.ok(desc.includes('Novembro de 2026: caixa R$ 4.000,00, competência R$ 7.000,00'), desc);

    // As barras refletem os números: competência de novembro (7.000) é maior que o caixa (4.000)
    const heights = await svg.locator('g.cac-group.active rect.cac-bar').evaluateAll(els => els.map(e => parseFloat(e.getAttribute('height'))));
    assert.ok(heights[1] > heights[0], `competência deve ser mais alta que caixa: ${heights}`);

    // Frase-resumo e dinheiro a caminho
    const lead = (await card.locator('.cac-lead').innerText()).replace(/\u00a0/g, ' ');
    assert.ok(lead.includes('produziu R$ 7.000,00, mas só R$ 4.000,00 cai na conta: R$ 3.000,00 ainda estão a caminho'), lead);
    const pipeline = (await card.locator('.cac-pipeline').innerText()).replace(/\u00a0/g, ' ');
    assert.ok(pipeline.includes('Total a receber de plantões:'), pipeline);

    // Tabela de valores (alternativa textual) com 6 meses
    assert.equal(await card.locator('table.cac-table tbody tr').count(), 6);
    assert.equal(await card.locator('tr[aria-current="date"] th').innerText().then(t => t.replace(/\s+/g, ' ').trim()), 'Nov atual');

    // Trocar o mês recentra o gráfico e a frase
    await page.click('#btn-next-month');
    assert.equal(await card.locator('g.cac-group.active text').textContent(), 'Dez');
    assert.ok((await card.locator('.cac-lead').innerText()).includes('Dezembro de 2026'));
    await page.click('#btn-prev-month');
    assert.equal(await card.locator('g.cac-group.active text').textContent(), 'Nov');

    // Regime de competência selecionado não muda o cartão (ele sempre compara os dois)
    await page.click('button[data-regime="competencia"]');
    assert.ok((await card.locator('.cac-lead').innerText()).includes('ainda estão a caminho'));
    await page.click('button[data-regime="caixa"]');

    // Só renderiza na Início (não pesa nas outras abas)
    await page.click('[data-tab="income"]');
    await page.evaluate(() => { document.getElementById('home-cashaccrual-container').innerHTML = ''; window.v8App.ui.render(); });
    assert.equal(await page.locator('#home-cashaccrual-container').innerHTML(), '', 'fora da Início o cartão não é recalculado');
    await page.click('[data-tab="home"]');
    assert.ok((await page.locator('#home-cashaccrual-container').innerHTML()).includes('cac-figure'));
  });
  // =========================================================================
  // CENÁRIO 9: ZERO ERROS NO CONSOLE E ZERO REQUISIÇÕES BLOQUEADAS
  // =========================================================================
  it('Cenário 9: Ausência total de erros no console do navegador e zero requisições externas bloqueadas', async () => {
    // 1. Verifica se houve algum erro de console durante todo o ciclo de vida
    assert.equal(consoleErrors.length, 0, `Nenhum erro de console permitido. Encontrados: ${consoleErrors.join(', ')}`);

    // 2. Verifica se todas as requisições de rede foram para o servidor local (zero CDNs ou nuvem)
    const externalRequests = networkRequests.filter(req => {
      return !req.url.startsWith(`http://localhost:${TEST_PORT}/`);
    });

    assert.equal(externalRequests.length, 0, `Nenhuma requisição externa permitida. Encontradas: ${externalRequests.map(r => r.url).join(', ')}`);
  });
});
