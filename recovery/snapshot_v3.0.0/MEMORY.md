# 🧠 MEMORY — Finanças Pediatria (Guia Canônico de Contexto & Memória do Sistema)

> **Documento Canônico de Memória para Agentes Autônomos, IAs e Desenvolvedores.**  
> Este arquivo sintetiza todo o histórico, regras de negócio, decisões arquiteturais, design system, convenções de testes e fluxos operacionais da aplicação **Finanças Pediatria (Versão 3.0.0 Ultra)**.  
> **Consulte este arquivo antes de planejar ou executar qualquer alteração no código.**

---

## 📌 1. Identidade do Produto & Metadados

- **Nome da Aplicação:** Finanças Pediatria
- **Versão Vigente:** `3.0.0`
- **Autor / Criador:** **FChNeto** (Constante imutável no código: `APP_CREATOR = 'FChNeto'`; exibida no rodapé, cabeçalho e modais).
- **Público-Alvo:** Médica Pediatra (atuação em maternidades, enfermarias, pronto-socorro infantil, UTI neonatal e consultório particular de puericultura).
- **Proposta de Valor:** Controle financeiro médico de alta performance, acolhedor e seguro, integrando consultório, plantões hospitalares postergados (80% D+60 / 20% D+90), DRE médica, inteligência do Fator R (28%), SBAR clínico LGPD-safe e conciliação bancária OFX.
- **Ambiente Principal:** Mobile-First — iPhone 16 Plus (430px x 932px) instalado como PWA via Safari com blindagem contra auto-zoom (`16px`).
- **Licença:** MIT (Copyright 2026 FChNeto).

---

## 🎨 2. Design System & Identidade Visual (*Pediatric Sanctuary V3*)

A interface segue a estética acolhedora, sofisticada e limpa desenvolvida para a médica pediatra:

### Paleta de Cores e Tokens (CSS em `css/styles.css`):
- `--primary-pink`: `#F48FB1` (Rosa suave primário, acolhedor).
- `--primary-pink-dark`: `#EC407A` (Rosa vibrante de destaque e botões principais).
- `--lilac-light`: `#F3E5F5` (Fundo de cartões e áreas secundárias).
- `--lilac-medium`: `#CE93D8` (Bordas e acentos suaves).
- `--lilac-dark`: `#AB47BC` (Rótulos secundários e elementos de contraste).
- `--mint-income`: `#26A69A` / `--mint-income-bg`: `#E0F2F1` (Verde menta para receitas e saldos positivos).
- `--coral-expense`: `#FF7043` / `--coral-expense-bg`: `#FBE9E7` (Coral suave para despesas e alertas de atraso).
- `--bg-app`: `#FBF8FD` (Fundo claro geral da aplicação).
- `--card-bg`: `#FFFFFF` (Fundo de cartões em modo claro).
- **Modo Noturno UTI Neonatal (`[data-theme="dark"]`, `.dark`):**
  - `--bg-app`: `#131016` (Fundo escuro profundo OLED-friendly).
  - `--card-bg`: `#1e1924` (Superfície escura com contraste ergonômico).
  - `--text-main`: `#f5eff7` / `--text-muted`: `#b0a5b8`.
  - `--border-color`: `rgba(255, 255, 255, 0.08)`.

### Tipografia & Controles:
- **Títulos, Números e Métricas:** `'Bricolage Grotesque'`, sans-serif.
- **Textos de Apoio, Rótulos, Botões e Formulários:** `'Manrope'`, sans-serif.
- **Selects & Dropdowns:** Proibido uso de selects nativos desformatados. Todos usam `.custom-select` com cantos arredondados (`rounded-2xl`) e chevron rosa pediátrico (`#b80f55`).
- **Margem Superior (Safe Area iOS):**
  ```css
  --safe-top: max(env(safe-area-inset-top, 0px), 52px);
  ```
- **Blindagem iOS Safari contra Auto-Zoom:**
  ```css
  input, select, textarea {
    font-size: 16px !important;
  }
  ```

---

## 🩺 3. Regras de Negócio Críticas & Módulos da V3

### A) Módulo Nativo de Consultório & Puericultura
- **Entidade `consultations` em `store.js`:**
  - Suporte a consultas avulsas e pacotes de acompanhamento do 1º ano de vida (`1º mês (RN)`, `2 meses`, `4 meses`, `6 meses`, `9 meses`, `12 meses`).
  - Métricas de rendimento por hora trabalhada (`consultationHourlyRate`) vs. plantões hospitalares (`shiftHourlyRate`).
  - Identificação clara da vantagem do consultório (`consultationAdvantagePercent`).

### B) Cálculo e Parcelamento de Plantões Médicos
1. **Fórmula Realista de Recebimento:**
   - **80% do valor líquido:** Creditado em **60 dias (D+60)**.
   - **20% restantes:** Creditados **30 dias após (D+90)**.
2. **Atribuição no Fluxo de Caixa:**
   - O Regime de Caixa projeta 80% no mês D+60 e 20% no mês D+90.
   - Projeção de 12 meses distribui as parcelas com exatidão matemática.

### C) Projeção Rolante de 12 Meses & Touch Scrubber
- Função `renderForecast12MSVG(projectionData)`:
  - 12 colunas correspondentes aos próximos 12 meses contínuos.
  - Linha de **Reserva Segura de 6 Meses** (baseada na média de custos fixos).
  - Curva Bezier de Saldo Acumulado.
  - Scrubber interativo arrastável por toque ou mouse com balão flutuante de dados.

### D) DRE Médica & Otimizador Dinâmico do Fator R (28%)
- Métodos `getDRE(periodStr)` e `getFatorROptimizer(referenceDate)`:
  - RBT12: Faturamento bruto dos últimos 12 meses.
  - Folha12: Pró-labore recomendado + encargos para atingir exatamente 28%.
  - Enquadramento seguro no **Anexo III (alíquota inicial de 6%)**, evitando o **Anexo V (15.5%)** e calculando a economia tributária anual em reais.

### E) SBAR Clínico LGPD-Safe
- Método `generateSBARHandoff(shift, options)`:
  - Situação, Background, Avaliação e Recomendação formatados para WhatsApp.
  - Higienização automática de identificação nominal de recém-nascidos e familiares para total conformidade com a LGPD médica.

### F) Extrator de Extratos OFX & CSV e Conciliação Bancária
- Métodos `parseOFX(content)`, `parseBankCSV(content)` e `reconcileBankTransactions(txs, refDate)`:
  - Identifica entradas (repasses hospitalares e consultas) e saídas (despesas operacionais da clínica).
  - Sugere baixa em 1 toque na interface.

### G) Kit do Contador em 1 Toque
- Método `generateAccountantKit(monthStr)`:
  - Gera resumo executivo para WhatsApp e arquivo CSV formatado para o Excel brasileiro com UTF-8 BOM (`\uFEFF`).

### H) Simulador FIRE da Médica Pediatra
- Método `getDoctorFIREMetrics(currentEquity)`:
  - Meta patrimonial baseada na regra dos 4% (25x gastos anuais).
  - Termômetro de liberdade indicando quantos plantões noturnos a médica pode abandonar permanentemente.

### I) Entrada Rápida por Voz com NLP Médico em Português
- Método `parseMedicalVoiceInput(transcript)`:
  - Interpreta termos como *"plantão"*, *"consulta"*, *" Sabará"*, *"12 horas"*, *"dia 15"*, *"dois mil e quinhentos reais"*.

### J) Armazenamento Dual-Engine L2 (`PediatricSanctuaryDB`)
- Camada secundária assíncrona em `IndexedDB` que sincroniza continuamente os dados com o `localStorage`.

---

## 🧪 4. Convenções de Testes Automatizados (71 Testes)

- Todos os testes residem na pasta `tests/` e são executados com `node --test tests/*.test.js`.
- O bundle `js/bundle.js` é unificado via `node scripts/build_bundle.js`.
- É **proibido alterar ou enfraquecer testes** para fazê-los passar. A solução deve sempre resolver o problema geral de forma robusta.

---

*Finanças Pediatria — Desenvolvido com segurança, carinho e excelência por FChNeto.* 🩺✨🌸
