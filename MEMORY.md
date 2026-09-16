# 🧠 MEMORY — Finanças Pediatria (Guia de Contexto & Memória do Sistema)

> **Documento Canônico de Memória para Agentes Autônomos, IAs e Desenvolvedores.**  
> Este arquivo sintetiza todo o histórico, regras de negócio, decisões arquiteturais, design system, convenções de testes e fluxos operacionais da aplicação **Finanças Pediatria**.  
> **Consulte este arquivo antes de planejar ou executar qualquer alteração no código.**

---

## 📌 1. Identidade do Produto & Metadados

- **Nome da Aplicação:** Finanças Pediatria
- **Autor / Criador:** **FChNeto** (Constante imutável no código: APP_CREATOR = 'FChNeto'; exibida no rodapé e no modal de perfil).
- **Público-Alvo:** Médica Pediatra (atuação em maternidades, enfermarias, pronto-socorro infantil, UTI neonatal e consultório).
- **Proposta de Valor:** Controle financeiro completo, intuitivo e acolhedor, adaptado às particularidades da carreira médica (plantões postergados, tributação PJ, escalas rotativas, múltiplos hospitais e monitor de fadiga CFM).
- **Ambiente de Uso Principal:** Mobile-First — iPhone 16 Plus (430px x 932px) instalado como PWA via Safari.
- **Licença:** MIT (Copyright 2026 FChNeto).

---

## 🎨 2. Design System & Identidade Visual (*Pediatric Sanctuary*)

A interface segue uma estética suave, acolhedora e elegante, evitando a frieza de planilhas contábeis:

### Paleta de Cores (Tokens CSS em css/styles.css):
- --primary-pink: #F48FB1: Rosa suave primário, acolhedor.
- --primary-pink-dark: #EC407A: Rosa vibrante de destaque e botões principais.
- --lilac-light: #F3E5F5: Fundo de cartões e áreas secundárias.
- --lilac-medium: #CE93D8: Bordas e acentos suaves.
- --lilac-dark: #AB47BC: Rótulos secundários e elementos de contraste.
- --mint-income: #26A69A / --mint-income-bg: #E0F2F1: Verde menta para receitas, saldos positivos e lucros.
- --coral-expense: #FF7043 / --coral-expense-bg: #FBE9E7: Coral suave para despesas e alertas de atraso.
- --bg-app: #FBF8FD: Fundo geral da aplicação (Sanctuary).
- --card-bg: #FFFFFF: Fundo de cartões e modais.
- --text-main: #2D3142 / --text-muted: #7A7E91: Tipografia de alta legibilidade.

### Tipografia & Controles:
- **Títulos, Números e Métricas:** 'Bricolage Grotesque', sans-serif.
- **Textos de Apoio, Rótulos, Botões e Formulários:** 'Manrope', sans-serif.
- **Selects & Dropdowns:** Proibido uso de selects nativos desformatados do SO. Todos os seletores usam .custom-select com cantos arredondados (ounded-2xl) e chevron rosa pediátrico (#b80f55).
- **Margem Superior (Safe Area iOS):**
  `css
  --safe-top: max(env(safe-area-inset-top, 0px), 52px);
  `
  Isso protege o topo contra sobreposição com a Dynamic Island, câmera e barra de status do iPhone 16 Plus.

---

## 🩺 3. Regras de Negócio Críticas

### A) Cálculo e Parcelamento de Plantões Médicos
1. **Fórmula Realista de Recebimento:**
   - **80% do valor líquido:** Creditado em **60 dias (D+60)**.
   - **20% restantes:** Creditados **30 dias após (D+90)**, completando o valor integral.
2. **Atribuição no Fluxo de Caixa:**
   - O Regime de Caixa projeta 80% do valor no mês de D+60 e os 20% restantes no mês de D+90.
   - O gráfico de previsão dos próximos 4 meses distribui exatamente cada parcela em seu mês de competência financeira.
3. **Status de Plantões:**
   - 'pending': Aguardando data prevista.
   - 'received': Confirmado o recebimento pela médica (baixa total ou por parcela).
   - 'delayed': Data prevista ultrapassada e não marcado como recebido (badge coral com gerador de cobrança via WhatsApp).

### B) Alíquota de Imposto Customizável (6% a 20%)
- Slider interativo de ajuste contínuo (estilo controle de volume de som) no cadastro do plantão.
- Valor inicial limpo (sem valores fixos prévios), permitindo à médica digitar o valor bruto negociado para a escala e ajustar a alíquota de acordo com a sua emissão de NF.

### C) Locais e Tipos de Vínculo
- **Locais Pré-configurados:** *Maternidade Araken*, *Maternidade Leide Morais*, *MEJEC*.
- **Expansão Livre:** Médica pode digitar e cadastrar novos hospitais/clínicas a qualquer momento.
- **Vínculos de Trabalho:** Seleção e edição livre (*Clínica*, *Serviço Público*, *Plantão em Maternidade*, *Plantão Hospitalar*...).

### D) Categorias Dinâmicas de Despesas & Escopo PF/PJ
- Categorias padrão: *Lazer, Educação, Alimentação, Transporte, Presentes, Lar, Beleza, Saúde, Viagens, Consultório/Sublocação, CRM/RQE/SBP, Congresso & Atualização, Brinquedos/Materiais Lúdicos, Combustível, Contador, Mercantil/Mercado, Lanches*.
- A médica tem total liberdade para criar categorias personalizadas no formulário ou nas configurações.
- Cada despesa e categoria é marcada como **Pessoa Física (PF)** ou **Pessoa Jurídica (PJ)**.
- **Troca Rápida de Categoria:** Ao clicar na badge de categoria de qualquer despesa listada na tela, abre-se um popover de seleção e busca rápida para alteração instantânea (openQuickCategoryChangeDialog).

### E) Regimes Contábeis (Caixa vs. Competência)
- **Regime de Caixa:** Salário do mês + parcelas de plantões cuja data prevista/realizada caia no mês - despesas pagas no mês.
- **Regime de Competência:** Produção total médica realizada no mês trabalhado (independente de quando será depositado) - despesas incorridas.

### F) Lixeira Segura & Desfazer Instantâneo (1-Tap Undo)
- Nenhum dado excluído é destruído imediatamente.
- Os arrays deletedShifts, deletedExpenses e deletedSalaries armazenam itens apagados.
- Toast com botão *"Desfazer"* é disparado após exclusões.
- Modal dedicado de Lixeira permite restauração unitária ou esvaziamento permanente.

### G) Reações Visuais Afetivas de Bebês
- **Receitas e Lucros:** Bebê sorridente com corações animados flutuantes (ssets/images/baby_happy.png com fallback em SVG inline).
- **Despesas:** Bebê choroso carinhoso (ssets/images/baby_sad.png com fallback em SVG inline).

### H) Monitor de Fadiga Médica (CFM) & Simulador PJ vs PF
- Monitora horas trabalhadas por semana/mês e alerta caso haja plantões noturnos consecutivos.
- Simulador tributário comparando Simples Nacional Anexo III (~6%) versus Carnê-Leão (27.5%), indicando a recomendação de 28% de pró-labore para o **Fator R**.

---

## 🏗️ 4. Arquitetura Técnica & Estrutura do Código

A aplicação foi construída com **HTML5 Semântico, CSS3 Moderno e Vanilla JavaScript (ES6+) Modular**, dispensando frameworks pesados para garantir carregamento instantâneo e total independência de servidores.

`	ext
├── index.html              # Shell da SPA mobile-first (Tailwind CDN + Design System Stitch)
├── manifest.json           # Manifesto PWA com escopo, cores e ícones de alta resolução
├── sw.js                   # Service Worker com cache estratégico para funcionamento offline
├── README.md               # Documentação pública para o repositório GitHub
├── RELEASE_NOTES.md        # Histórico de releases e notas da versão v2.5.0
├── MEMORY.md               # [ESTE ARQUIVO] Memória técnica e guia para agentes
├── RECOVERY.md             # Instruções de recuperação e restauração de versões estáveis
├── LICENSE                 # Licença MIT (Copyright 2026 FChNeto)
├── package.json            # Metadados e scripts de build/teste
├── .gitignore              # Proteção contra arquivos de sistema, logs e temporários
├── .gitattributes          # Normalização de quebras de linha
│
├── assets/
│   ├── icons/              # Favicon, Apple Touch Icon, Icon-192 e Icon-512
│   └── images/             # Banner promocional e reações animadas de bebês
│
├── css/
│   └── styles.css          # Design System completo, Safe Area, modais, formulários e print
│
├── js/
│   ├── store.js            # Motor financeiro contábil, cálculos D+60/D+90, lixeira e LocalStorage
│   ├── app.js              # Controlador central da interface, rotas, formulários e toasts
│   ├── charts.js           # Gerador de gráficos vetoriais puros em SVG (sem Chart.js)
│   ├── icons.js            # Biblioteca integrada de ícones vetoriais com fallback
│   └── bundle.js           # Bundle consolidado gerado automaticamente (zero-CORS)
│
├── scripts/
│   ├── build_bundle.js     # Script de concatenação e empacotamento do bundle
│   ├── restore_v2.5.0.js   # Script de restauração via Node.js
│   ├── restore_v2.5.0.bat  # Script de restauração em 1 clique para Windows
│   └── restore_v2.5.0.ps1  # Script de restauração via PowerShell
│
├── recovery/
│   └── snapshot_v2.5.0/    # Cópia congelada integral da versão estável v2.5.0
│
└── tests/                  # Suíte completa de 59 testes automatizados
    ├── charts.test.js
    ├── clinical_features.test.js
    ├── edge_cases.test.js
    ├── enhancements.test.js
    ├── icons.test.js
    ├── layout_bundle.test.js
    ├── pediatric_enhancements.test.js
    └── store.test.js
`

---

## 📂 5. Diretórios de Trabalho & Sincronização Dupla

O projeto possui **dois diretórios principais** na máquina do usuário:
1. **Workspace Primário (Antigravity):**  
   c:\Users\chibe\OneDrive\Área de Trabalho\Antigravity\Nanda
2. **Repositório Git Local (GitHub):**  
   C:\Users\chibe\OneDrive\Documentos\GitHub\Nanda_ped  
   - Branch de trabalho: NandapedV2  
   - Remote: https://github.com/Chneto/Nanda_ped.git  
   - Executável do Git: C:\Users\chibe\AppData\Local\GitHubDesktop\app-3.6.5\resources\app\git\cmd\git.exe

### ⚠️ Regra de Sincronização Obrigatória para Agentes:
Qualquer alteração realizada no Workspace Primário **DEVE** ser sincronizada para a pasta do repositório Git local, garantindo que o usuário consiga commitar ou publicar diretamente pelo GitHub Desktop ou Terminal.

---

## 🧪 6. Testes Automatizados & Comandos

Sempre que qualquer arquivo em js/ for modificado:
1. Execute a compilação do bundle:
   `ash
   node scripts/build_bundle.js
   `
2. Execute a suíte de 59 testes automatizados:
   `ash
   npm test
   # ou
   node --test tests/*.test.js
   `
3. **Nenhum teste pode falhar.** Todos os 59 testes cobrem limites contábeis, bissexto, alíquotas, parcelamento D+60/D+90, integridade do Service Worker e layout do iPhone 16 Plus.

---

## 🛡️ 7. Diretrizes para Futuros Agentes de IA

1. **Preserve a Assinatura do Criador:** O texto "Criado por FChNeto" e a constante APP_CREATOR = 'FChNeto' são imutáveis e devem permanecer intactos.
2. **Mantenha a Paleta Rosa Pediátrica:** Não altere a identidade visual para temas genéricos ou frios.
3. **Zero Dependências Pesadas:** Não adicione frameworks JS externos (como React ou Vue) nem bibliotecas pesadas de gráficos (como Chart.js ou D3). A aplicação deve permanecer ultraleve em Vanilla JS com gráficos em SVG puro.
4. **Mantenha o Bundle Sincronizado:** Sempre que editar js/app.js, js/store.js, js/charts.js ou js/icons.js, execute 
ode scripts/build_bundle.js para atualizar js/bundle.js.
5. **Consulte o Recovery em caso de Falhas:** Se alguma alteração corromper a aplicação ou quebrar testes, utilize os procedimentos descritos em RECOVERY.md.
