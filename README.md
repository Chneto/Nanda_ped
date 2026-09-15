# 🌸 Finanças Pediatria — Gestão Financeira Pediátrica (PWA)

![Finanças Pediatria Showcase](./assets/images/showcase.png)

[![Versão](https://img.shields.io/badge/Versão-2.5.0-EC407A?style=for-the-badge&logo=apple)](./RELEASE_NOTES.md)
[![Testes Automatizados](https://img.shields.io/badge/Testes-59%20Pass-26A69A?style=for-the-badge&logo=node.js)](./tests/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline--First-AB47BC?style=for-the-badge&logo=pwa)](./manifest.json)
[![Licença MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-blue?style=for-the-badge)](./LICENSE)
[![Criado por](https://img.shields.io/badge/Criado%20por-FChNeto-F48FB1?style=for-the-badge)](#-autoria--créditos)

> **Aplicação Web Mobile-First (PWA) de Controle Financeiro de Alta Performance criada sob medida para Médicas Pediatras.**  
> Gerenciamento inteligente de **Salário Fixo**, **Plantões Médicos Fracionados (80% D+60 / 20% D+90)**, **Regime de Caixa vs. Competência**, **Categorias Personalizadas PF & PJ**, **Slider de Alíquota (6%-20%)**, **Lixeira com Recuperação Instantânea**, **Reações Afetivas Infantis**, **Simulador Tributário PJ** e **Monitor de Fadiga Médica (CFM)**.

---

## 🩺 Destaques & Funcionalidades Principais

| Recurso | Descrição |
| :--- | :--- |
| **🍼 Motor de Plantões Parcelados (80% D+60 / 20% D+90)** | Cálculo automático da rotina médica real: 80% creditado em 60 dias e 20% em 90 dias (30 dias após), projetando entradas precisas no fluxo de caixa e nos gráficos. |
| **🏷️ Categorias Livres & Escopo PF/PJ** | Crie qualquer categoria que desejar (*Contador*, *Mercantil/Mercado*, *Lanches*, *Combustível*, etc.), classifique entre Vida Pessoal (PF) ou Trabalho (PJ) e troque direto nos cards em 1 toque. |
| **🎚️ Barra Deslizante de Imposto (6% a 20%)** | Slider interativo estilo volume de áudio para definir a alíquota tributária desejada com cálculo imediato do valor líquido a receber. |
| **📱 Margem Superior Blindada (Safe Area iOS)** | Ajuste inteligente --safe-top para iPhone 16 Plus e demais telas móveis, garantindo que o cabeçalho nunca fique cortado pela Dynamic Island, câmera ou barra de status. |
| **🗑️ Lixeira Segura & Desfazer Imediato (1-Tap Undo)** | Exclusões acidentais de plantões, despesas ou salários podem ser desfeitas na hora via toast ou recuperadas no painel de Lixeira. |
| **👶 Reações Visuais de Bebês** | Microinterações temáticas: bebê sorridente cercado de corações flutuantes ao registrar entradas e bebê choroso carinhoso ao registrar despesas. |
| **👁️ Modo Sigilo (Privacy Mode)** | Oculte ou revele todos os saldos e valores da tela com 1 toque no cabeçalho (estilo app bancário), ideal para consultar perto de colegas de plantão. |
| **📅 Visão em Lista & Modo Calendário** | Alterne entre a listagem detalhada e a visualização em grade mensal de escala de plantões para planejar o mês com clareza. |
| **⚠️ Alerta Inteligente de Atrasos** | Plantões vencidos sem confirmação de depósito recebem automaticamente a badge coral *"Atrasado"*, com gerador de mensagem elegante para cobrança ao faturamento via WhatsApp. |
| **⚖️ Regime de Caixa vs. Competência** | Alterne em 1 clique entre o **Regime de Caixa** (o que cai na conta no mês) e o **Regime de Competência** (a produção médica realizada no mês trabalhado). |
| **💡 Simulador Tributário Médico (PJ vs PF)** | Simula a economia real entre tributação na Pessoa Jurídica (Simples Nacional Anexo III ~6%) versus Carnê-Leão/PF (27.5%), recomendando o **Fator R (28% Pro-labore)**. |
| **🧘 Monitor de Bem-Estar & Fadiga (CFM)** | Alinhado às diretrizes do CFM, monitora a carga horária semanal/mensal e emite alertas preventivos contra plantões noturnos consecutivos. |
| **🔄 Passagem de Plantão & Troca de Escala** | Gera mensagens pré-formatadas para solicitação de troca de plantão com colegas via WhatsApp com todos os detalhes do turno. |
| **📄 Extrato Timbrado Pediátrico** | Relatório profissional pronto para impressão ou geração de PDF (Ctrl+P / Compartilhar), formatado para envio à contabilidade médica. |
| **📊 Rentabilidade & Valor por Hora** | Calcula o rendimento líquido real por hora trabalhada em cada hospital ou maternidade parceira (Araken, Leide Morais, MEJEC, etc.). |
| **📈 Gráficos SVG Puros (Sem Bibliotecas Pesadas)** | Projeção dos próximos 4 meses em gráfico de barras/área e rosca dinâmica de despesas com comparativo mês a mês. |
| **📲 PWA Instalável (iPhone & Android)** | Aplicativo que instala na tela de início com ícones em alta definição e funciona offline via Service Worker. |
| **🔒 100% Seguro & Privado** | Dados gravados exclusivamente no localStorage do seu dispositivo móvel. Sem servidores de terceiros espionando suas finanças. |
| **✍️ Criado por FChNeto** | Assinatura oficial do desenvolvedor gravada no código-fonte e destacada no rodapé da aplicação. |

---

## 📱 Como Abrir e Instalar no seu Celular

Como a aplicação é um **PWA (Progressive Web App)**, ela não precisa de lojas de apps para ser instalada:

### 🍎 No iPhone ou iPad (Safari)
1. Abra o link da aplicação no navegador **Safari**.
2. Toque no botão de **Compartilhar** (ícone de quadrado com a seta para cima ⎋ na barra inferior do Safari).
3. Role para baixo e toque em **"Adicionar à Tela de Início"** (ícone de ➕).
4. Toque em **"Adicionar"** no canto superior direito.
5. Pronto! O app **Finanças Pediatria** abrirá em tela cheia como um aplicativo nativo.

### 🤖 No Android (Google Chrome)
1. Abra o link da aplicação no navegador **Google Chrome**.
2. Toque no menu de **três pontinhos** (⋮) no canto superior direito.
3. Selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.
4. Confirme a instalação.

---

## 🚀 Como Publicar no GitHub e Ativar o GitHub Pages

### Método 1: Pelo GitHub Desktop (Recomendado)
Se você utiliza o **GitHub Desktop**:
1. Abra o aplicativo **GitHub Desktop**.
2. Selecione o repositório **Nanda_ped** (ou abra a pasta C:\Users\chibe\OneDrive\Documentos\GitHub\Nanda_ped).
3. O GitHub Desktop detectará automaticamente todos os arquivos novos e atualizados.
4. No campo inferior esquerdo (Summary), digite:  
   eat: Finanças Pediatria v2.5.0 - Categorias Livres, Parcelamento D+60/D+90 e UI Manrope
5. Clique no botão azul **Commit to main** (ou **Commit to NandapedV2**).
6. Clique no botão superior **Push origin** para enviar para o GitHub.
7. No GitHub (navegador), acesse o repositório -> **Settings** -> **Pages** -> selecione a branch e clique em **Save**. O link do app estará online em instantes!

---

### Método 2: Pelo Navegador (GitHub Web)
1. Acesse seu repositório no [GitHub](https://github.com/Chneto/Nanda_ped).
2. Clique no botão **Add file** -> **Upload files**.
3. Arraste todos os arquivos da pasta do projeto (index.html, manifest.json, sw.js, README.md, RELEASE_NOTES.md, LICENSE, package.json, pastas css/, js/, ssets/, 	ests/, scripts/).
4. Clique em **Commit changes**.
5. Em **Settings -> Pages**, selecione a branch principal, pasta / (root) e salve.

---

### Método 3: Pelo Terminal (Git CLI)
`ash
# Na pasta do repositório:
git add .
git commit -m "feat: Finanças Pediatria v2.5.0 release"
git push origin NandapedV2
`

---

## 📂 Estrutura do Projeto

`	ext
├── index.html              # Shell HTML5 semântico com Tailwind e tokens do Design System
├── manifest.json           # Manifesto PWA com identificadores, cores de tema e ícones HD
├── sw.js                   # Service Worker para cache inteligente e operação 100% offline
├── README.md               # Documentação completa do projeto e guia de uso
├── RELEASE_NOTES.md        # Notas detalhadas da versão v2.5.0 e histórico de melhorias
├── LICENSE                 # Licença MIT aberta e documentada
├── package.json            # Metadados do projeto e scripts npm (test e build)
├── .gitignore              # Filtro de arquivos de SO, logs e temporários
├── .gitattributes          # Normalização de finais de linha (LF/CRLF)
│
├── assets/
│   ├── icons/              # Ícones oficiais PWA em múltiplas resoluções
│   │   ├── favicon.png
│   │   ├── apple-touch-icon.png
│   │   ├── icon-192.png    # Ícone padrão de tela de início
│   │   └── icon-512.png    # Splash screen de inicialização
│   └── images/
│       ├── showcase.png    # Banner oficial de exibição do app
│       ├── baby_happy.png  # Bebê sorridente com corações (entradas)
│       └── baby_sad.png    # Bebê choroso carinhoso (despesas)
│
├── css/
│   └── styles.css          # Design System Stitch, Safe Area iOS e responsividade
│
├── js/
│   ├── app.js              # Controlador SPA (rotas, modais, reações de bebês, selects)
│   ├── store.js            # Engine financeiro, D+60/D+90, lixeira, categorias PF/PJ
│   ├── charts.js           # Gerador de gráficos vetoriais puros em SVG
│   ├── icons.js            # Biblioteca integrada de ícones vetoriais com fallback
│   └── bundle.js           # Bundle compilado e unificado (zero-CORS e execução local)
│
├── scripts/
│   └── build_bundle.js     # Script de empacotamento automatizado do bundle
│
└── tests/                  # Suíte completa com 59 testes automatizados
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

## 🧪 Testes Automatizados

O projeto conta com **59 testes unitários** automatizados cobrindo todo o motor financeiro, regras contábeis, bissexto, regimes de competência vs. caixa, parcelamento 80% D+60 / 20% D+90, slider de alíquota 6%-20%, lixeira e desfazer em 1 toque, conformidade com as diretrizes do CFM, tipografia e layout do iPhone 16 Plus.

Para rodar a suíte de testes:

`ash
# Opção 1: Via script de testes Node.js
node scripts/build_bundle.js
node --test tests/*.test.js

# Opção 2: Via npm
npm test
`

Resultado da execução:
`	ext
✔ 59 pass
✔ 0 fail
✔ 100% de conformidade com regras clínicas e contábeis
`

---

## 🎨 Design System & Identidade Visual

Desenvolvido sob o conceito **Pediatric Sanctuary & Stitch Design System**:

- **Rosa Suave Primário:** #F48FB1
- **Rosa Escuro Vibrante:** #EC407A
- **Lilás Acolhedor:** #CE93D8 / #AB47BC
- **Verde Menta (Entradas / Lucros):** #26A69A
- **Coral Pediátrico (Despesas / Atrasos):** #FF7043
- **Fundo App Sanctuary:** #FBF8FD
- **Tipografia:** Bricolage Grotesque (Títulos & Métricas) + Manrope (Corpo & Controles)

---

## ✍️ Autoria & Créditos

- **Aplicação:** Finanças Pediatria
- **Criado por:** **FChNeto**
- **Licença:** [MIT](./LICENSE)

Desenvolvido especialmente para empoderar e simplificar a vida financeira de médicas pediatras! 🩺🌸
