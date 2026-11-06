/**
 * Finanças Pediatria /v8/ - Suíte Oficial de Testes E2E no Navegador
 * Emulação iPhone 16 Plus (430x932, Mobile Safari, Touch Events)
 * Validando Cenários 1 a 9 com Playwright
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestServer } from './test_server.js';

let chromium = null;
let devices = null;
try {
  const pw = await import('playwright');
  chromium = pw.chromium;
  devices = pw.devices;
} catch (e) {
  // Playwright opcional para ambientes sem devDependencies instaladas
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
      form.querySelector('select[name="macro_group"]').value = 'Formação & Carreira';
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

    // 3. Toca no card do plantão salvo
    await page.locator('[data-shift-card-id]').first().click();

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
