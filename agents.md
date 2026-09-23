# 🤖 AGENTS — Protocolo Operacional para Agentes Autônomos e Desenvolvedores

> **Guia Obrigatório para Modelos de Linguagem, Subagentes de IA e Engenheiros de Software.**  
> **Aplicação:** Finanças Pediatria  
> **Autor Imutável:** **FChNeto** (`APP_CREATOR = 'FChNeto'`)  
> **Status de Confiabilidade:** 94 Testes Automatizados Aprovados (0 Falhas)  

---

## 🧭 1. Princípios Fundamentais & Missão do Agente

Todo agente autônomo (ou desenvolvedor) que atuar neste repositório DEVE operar sob as seguintes premissas invioláveis:

1. **A Médica em Primeiro Lugar:** O software é utilizado por uma Médica Pediatra (**Dra. Fernanda Ch.**) em rotina hospitalar exaustiva (UTI neonatal, sala de parto, enfermarias pediátricas, consultório particular). A aplicação deve transmitir paz visual, clareza absoluta, rapidez de lançamento e zero frustração técnica.
2. **Assinatura e Autoria do Criador:** O valor `APP_CREATOR = 'FChNeto'` é uma constante canônica e imutável. Deve permanecer nos metadados, rodapés, telas de créditos, documentações e suítes de testes.
3. **Duas Variantes do Produto no Repositório:**
   - **`/v2.0/` — Sanctuary Minimalist:** Aplicação higienizada, enxuta, sem qualquer poluição visual, com 3 abas essenciais (Início, Ganhos, Despesas), 22 categorias canônicas de despesas, regras D+60 (80%) e D+90 (20%), compras parceladas e persistência tripla no iOS.
   - **`/` — Master Executive (v3.x):** Aplicação executiva expandida com consultório de puericultura, DRE médica, Fator R (28%), SBAR clínico LGPD, conciliação OFX/CSV, simulador FIRE e entrada por voz.
4. **Respeito aos Testes Automatizados:** Nenhuma alteração pode ser dada como concluída sem a execução prévia e aprovação de **100% dos testes** em `node --test tests/*.test.js`. É **estritamente proibido** desativar, deletar ou afrouxar asserções de testes para mascarar erros de código.

---

## 🛠️ 2. Padrões de Engenharia & Invariantes Técnicas

```
+--------------------------------------------------------------------------+
|                        INVARIANTES ARQUITETURAIS                         |
+--------------------------------------------------------------------------+
| 1. Vanilla ES6+ & Zero Build Bloat em Runtime                            |
| 2. Pure Inline SVGs (Anti-Blowout de Ligaduras de Fontes)                |
| 3. Mobile-First iPhone 16 Plus (Safe-Areas & Viewport Shield)            |
| 4. Persistência Tripla para Safari / iOS WebKit                          |
| 5. In-Flow Expansion para Seletores Modais (Anti-Crop)                   |
+--------------------------------------------------------------------------+
```

### A) Vanilla ES6+ & CSS Moderno
- O projeto não utiliza frameworks pesados com compiladores lentos em runtime.
- Os módulos utilizam sintaxe padrão `import`/`export`.
- O bundle consolidado de produção é mantido via script simples (`node scripts/build_bundle.js`).

### B) Ícones Nativos em SVG (Blindagem Anti-Blowout)
- **Problema histórico:** Depender exclusivamente de fontes externas (como Material Symbols via CDN) causava falhas de carregamento em redes hospitalares instáveis, fazendo com que textos como `"vital_signs"`, `"calendar_month"` ou `"add"` aparecessem como palavras cruas gigantes destruindo o layout.
- **Regra do Agente:** Todos os ícones essenciais de navegação, médicos e financeiros DEVEM possuir representação inline SVG em `js/icons.js` ou `v2.0/js/icons.js`. Sempre utilize os métodos `getIconSvg(name)` ou a tag de fallback embutida.

### C) Ergonomia iPhone & Safe Areas
- O design é projetado para a proporção do iPhone 16 Plus (largura máxima de `430px` a `480px` centralizada na tela).
- **Safe-Areas obrigatórias:**
  ```css
  --safe-top: env(safe-area-inset-top, 44px);
  --safe-bottom: env(safe-area-inset-bottom, 34px);
  ```
- **Blindagem contra auto-zoom do Safari:** Todo `input`, `select` e `textarea` deve ter `font-size: 16px` (ou superior) para impedir que o iOS aplique zoom automático destrutivo na tela quando o teclado for aberto.

### D) Persistência Tripla Definitiva no iOS (Contra Purgas do Safari)
- O Safari e o WebKit isolam PWAs instalados na tela de início e possuem políticas agressivas de limpeza de dados após inatividade.
- **Camadas que o agente DEVE preservar:**
  1. `localStorage` síncrono para render imediato sem piscar a tela.
  2. `IndexedDB` (`v2_pediatric_db` ou `PediatricSanctuaryDB`) assíncrono para retenção permanente.
  3. `navigator.storage.persist()` acionado na inicialização.
  4. Listeners em `visibilitychange` e `pagehide` garantindo gravação instantânea ao minimizar o app.
  5. Exportação em 1 toque ("Salvar no Meu iPhone") usando a **Web Share API nativa** para gravar o arquivo `.json` de backup diretamente no app **"Arquivos"** ou **iCloud Drive** da médica.
  6. **Importante:** Nunca armazene strings Base64 gigantescas de fotos em `localStorage` (o limite do iOS é 5MB); fotos devem ser comprimidas via Canvas e guardadas com segurança no IndexedDB.

### E) Arquitetura *In-Flow Expansion* Anti-Crop para Modais
- Ao abrir menus dropdowns dentro de caixas de diálogo ou modais, o menu deve expandir no fluxo normal do elemento (`position: relative !important`), expandindo a altura de rolagem (`scrollHeight`) e empurrando naturalmente os botões inferiores.
- Nunca posicione menus como `absolute` sem prever o overflow do diálogo pai, evitando o corte visual (*crop*) de opções inferiores.

---

## 🩺 3. Regras de Negócio & Cálculos Financeiros Invioláveis

### A) Plantões em Sala de Parto (D+60 e D+90)
- Ao cadastrar um plantão médico:
  - **80% do valor líquido:** Creditado no mês correspondente a **D+60 (2 meses após a data trabalhada)**.
  - **20% do valor líquido restante:** Creditado no mês correspondente a **D+90 (3 meses após a data trabalhada)**.
- O utilitário `addMonthsToDateString(date, months)` deve tratar o fechamento de meses (ex: 31 de Março + 2 meses = 31 de Maio; 31 de Março + 3 meses = 30 de Junho).

### B) As 22 Categorias Obrigatórias de Despesas
A versão v2.0 pré-configura e garante a presença das 22 categorias requisitadas:
1. `Passagens`
2. `Mercantil`
3. `Academia`
4. `Estudo`
5. `Cursos`
6. `Presentes`
7. `Aluguel`
8. `Energia`
9. `Internet`
10. `Combustível`
11. `Qualificação/Congresso/Pós`
12. `Cosméticos`
13. `Água`
14. `Lanches`
15. `Doação`
16. `Refeição`
17. `Beleza/Salão`
18. `Uber`
19. `Remédios`
20. `Compras Parceladas`
21. `Saídas`
22. `Delivery`
23. `Produtos de beleza`

### C) Compras Parceladas no Tempo
- Quando a opção de compra parcelada for selecionada (2x a 24x), o motor deve criar os registros individuais com as datas projetadas nos meses seguintes (`baseDate + (i - 1) meses`) e distribuir centavos de arredondamento na primeira parcela.

### D) Regime de Caixa vs. Regime de Competência
- **Regime de Caixa:** Considera a entrada real no banco (Salário da Residência + parcelas D+60 e D+90 que vencem no mês de consulta - Despesas do mês de consulta).
- **Regime de Competência:** Considera a produção da médica (Salário da Residência + valor total dos plantões trabalhados no mês de consulta).

---

## 🧪 4. Protocolo de Testes & Verificação

Antes de realizar qualquer commit ou declarar uma tarefa concluída, o agente deve executar:

```bash
# 1. Execução de toda a suíte de testes (94 testes)
node --test tests/*.test.js

# 2. Execução específica da suíte v2.0
node --test tests/v2_suite.test.js
```

### Critérios de Aceite:
- Total de testes: **94**
- Falhas: **0**
- Cancelados: **0**
- Tempo de execução: **< 1 segundo**

---

## 📦 5. Fluxo de Deploy, Sincronização & Git

O ambiente local do usuário opera em duas pastas conectadas:
1. **Pasta de Trabalho do Antigravity (Workspace):**  
   `c:\Users\chibe\OneDrive\Área de Trabalho\Antigravity\Nanda\`
2. **Repositório Git Local (Clone):**  
   `C:\Users\chibe\OneDrive\Documentos\GitHub\Nanda_ped`

### Procedimento Padrão para Publicação:
```powershell
# 1. Sincronizar arquivos do workspace para o repositório Git
robocopy "c:\Users\chibe\OneDrive\Área de Trabalho\Antigravity\Nanda" "C:\Users\chibe\OneDrive\Documentos\GitHub\Nanda_ped" /E /XD .git node_modules .gemini /XF .DS_Store

# 2. Navegar para a pasta do repositório
cd "C:\Users\chibe\OneDrive\Documentos\GitHub\Nanda_ped"

# 3. Validar testes no repositório Git
node --test tests/*.test.js

# 4. Adicionar arquivos e commitar
git add -A
git commit -m "tipo: Descrição concisa da melhoria realizada"

# 5. Publicar nas duas branches de produção
git push origin NandapedV2
git checkout main
git merge NandapedV2 -m "Merge NandapedV2 into main"
git push origin main
git checkout NandapedV2
```

---

## 🗂️ 6. Gestão de Memória e Recuperação

- Sempre que houver nova versão ou modificação estrutural relevante:
  - Atualize `MEMORY.md` com a síntese arquitetural e novos recursos.
  - Crie um snapshot imutável em `recovery/snapshot_vX.X/`.
  - Registre o novo snapshot em `RECOVERY.md`.
  - Atualize `walkthrough.md` no diretório de artefatos.

---

*Seguir rigorosamente este protocolo garante que a aplicação da médica pediatra permaneça impecável, robusta, acolhedora e protegida contra regressões.* 🩺🌸✨
