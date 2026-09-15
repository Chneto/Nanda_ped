# 🌸 Finanças Pediatria — Gestão Financeira Pediátrica (PWA)

![Finanças Pediatria Showcase](./assets/images/showcase.png)

> **Aplicação Web Mobile-First (PWA) de Controle Financeiro de Alta Performance criada sob medida para Médicas Pediatras.**  
> Gerenciamento inteligente de **Salário Fixo**, **Plantões Médicos (D+90 / Prazos Customizados)**, **Regime de Caixa vs. Competência**, **Previsão Orçamentária**, **Simulador Tributário PJ**, **Monitor de Fadiga Médica (CFM)** e **Despesas Especializadas**.

---

## 🩺 Destaques & Funcionalidades Principais

| Recurso | Descrição |
| :--- | :--- |
| **🍼 Motor de Plantões D+90** | Cadastro ágil de plantões informando hospital, setor (UTI Neonatal, PS Infantil, Enfermaria, Berçário, etc.), data e prazo de recebimento (D+30, D+60, D+90 padrão ou data customizada). Projeta automaticamente o depósito. |
| **👁️ Modo Sigilo (Privacy Mode)** | Oculte ou revele todos os saldos e valores da tela com 1 toque no cabeçalho (estilo Nubank/Mobills), ideal para usar discretamente durante o plantão ou perto de colegas. |
| **📅 Visão em Lista & Modo Calendário** | Alterne entre a lista tradicional com régua de prazos (D+30/60/90) e a nova **Visão em Calendário Mensal** para enxergar visualmente a escala de trabalho do mês. |
| **⚠️ Alerta Inteligente de Atrasos** | Plantões vencidos sem confirmação de depósito recebem automaticamente a badge coral *"Atrasado"*, com gerador de mensagem elegante para cobrança ao faturamento via WhatsApp. |
| **⚖️ Regime de Caixa vs. Competência** | Alterne em 1 clique entre o **Regime de Caixa** (o que efetivamente cai na conta no mês) e o **Regime de Competência** (a produção total realizada no mês trabalhado). |
| **💡 Simulador Tributário Médico (PJ vs PF)** | Simula a economia real entre tributação na Pessoa Jurídica (Simples Nacional Anexo III ~6%) versus RPA/Pessoa Física (27.5%), com cálculo de recomendação do **Fator R (28% Pro-labore)**. |
| **🧘 Monitor de Bem-Estar & Fadiga (CFM)** | Alinhado às diretrizes do CFM, monitora a carga horária semanal e mensal, emite alertas preventivos contra plantões noturnos consecutivos e cuida da saúde da médica. |
| **🔄 Passagem de Plantão & Troca de Escala** | Botão para gerar mensagens pré-formatadas para solicitação de troca de plantão com colegas de equipe via WhatsApp com todos os detalhes clínicos do turno. |
| **📄 Extrato Timbrado Pediátrico** | Relatório profissional pronto para impressão ou geração de PDF (`Ctrl+P` / Compartilhar), ideal para envio à contabilidade médica ou conciliação bancária. |
| **📊 Rentabilidade & Valor por Hora** | Análise comparativa que calcula o rendimento líquido real por hora trabalhada em cada hospital ou maternidade parceira. |
| **💼 Gestão de Salário Fixo** | Cadastro do vínculo/consultório fixo mensal e dia de vencimento, integrado à conciliação mensal. |
| **📈 Gráficos SVG Puros** | Gráfico de Linha/Barras com projeção dos **próximos 4 meses** e Gráfico de Rosca com divisão de gastos por categorias pediátricas. |
| **📲 PWA Instalável (iPhone & Android)** | Aplicativo que pode ser instalado na tela de início com ícones dedicados em alta definição e suporte a uso offline via Service Worker. |
| **🔒 100% Seguro & Privado** | Dados armazenados localmente no seu aparelho (`localStorage`). Zero dependência de nuvem de terceiros ou servidores externos. |
| **✨ Estado Inicial Limpo** | Inicia totalmente zerado para a médica começar a usar de imediato, com opção de **"Carregar Dados de Exemplo"** caso deseje demonstrar a aplicação. |

---

## 📱 Como Abrir e Instalar no seu Dispositivo

A aplicação foi desenvolvida no padrão **PWA (Progressive Web App)**, permitindo ser instalada diretamente no celular sem passar por lojas de aplicativos:

### 🍎 No iPhone ou iPad (Safari)
1. Abra o link da aplicação no navegador **Safari**.
2. Toque no botão de **Compartilhar** (o ícone de quadrado com a seta para cima `⎋` na barra inferior).
3. Role as opções para baixo e toque em **"Adicionar à Tela de Início"** (ícone de `➕`).
4. Toque em **"Adicionar"** no canto superior direito.
5. Pronto! O ícone do **Finanças Pediatria** aparecerá na sua tela de início e abrirá em tela cheia como um aplicativo nativo.

### 🤖 No Android (Google Chrome)
1. Abra o link da aplicação no navegador **Chrome**.
2. Toque no menu de **três pontinhos** (`⋮`) no canto superior direito.
3. Selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.
4. Confirme a instalação.

---

## 🚀 Como Publicar Gratuitamente no GitHub Pages

Siga este passo a passo simples para colocar a sua aplicação no ar e obter o link compartilhável:

### Método 1: Pelo Navegador (Sem precisar instalar nada)

1. Acesse sua conta no [GitHub](https://github.com/) e clique em **New repository** (Novo Repositório).
2. Dê um nome ao repositório (por exemplo: `pediatria-chic` ou `controle-financeiro`).
3. Deixe o repositório marcado como **Public** (Público) e clique em **Create repository**.
4. Na página que surgir, clique no link **"uploading an existing file"** (ou arraste os arquivos).
5. Selecione todos os arquivos e pastas deste projeto:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `README.md`
   - pasta `css/`
   - pasta `js/`
   - pasta `assets/`
6. Clique no botão verde **Commit changes**.
7. Agora, vá até a aba **Settings** (Configurações) do seu repositório no topo da página.
8. No menu lateral esquerdo, clique em **Pages**.
9. Na seção **Build and deployment**:
   - Em **Source**, selecione **Deploy from a branch**.
   - Em **Branch**, selecione a branch `main` e a pasta `/(root)`.
   - Clique em **Save**.
10. Aguarde cerca de 1 a 2 minutos e recarregue a página. O GitHub exibirá o link público da sua aplicação:  
    `https://<seu-usuario>.github.io/<nome-do-repositorio>/`

---

### Método 2: Pelo Terminal (Git CLI)

Se tiver o `git` instalado no seu computador:

```bash
# 1. Inicialize o repositório local
git init

# 2. Adicione todos os arquivos
git add .

# 3. Crie o commit inicial
git commit -m "feat: Finanças Pediatria PWA para médica pediatra"

# 4. Vincule ao seu repositório do GitHub
git branch -M main
git remote add origin https://github.com/<seu-usuario>/<nome-do-repositorio>.git

# 5. Envie os arquivos
git push -u origin main
```

Após o push, vá em **Settings -> Pages** no GitHub e selecione `main` / `root` para ativar o site.

---

## 📂 Estrutura do Projeto

```text
├── index.html              # Shell HTML5 semântico com Tailwind e tokens de design
├── manifest.json           # Manifesto PWA com identificadores, tema e ícones
├── sw.js                   # Service Worker para cache estático e modo offline
├── README.md               # Documentação completa e guia de implantação
│
├── assets/
│   ├── icons/              # Ícones oficiais do App em múltiplas resoluções
│   │   ├── favicon.png
│   │   ├── apple-touch-icon.png
│   │   ├── icon-192.png    # PWA Standard Icon
│   │   └── icon-512.png    # PWA Splash Screen Icon
│   └── images/
│       └── showcase.png    # Imagem promocional de exibição do projeto
│
├── css/
│   └── styles.css          # Design System com variáveis CSS (iPhone 16 Plus) e print styles
│
├── js/
│   ├── app.js              # Controlador SPA (rotas, interações, modais, toasts, impressões)
│   ├── store.js            # Engine financeiro, D+90, simulador tributário e monitor de fadiga
│   ├── charts.js           # Gerador de gráficos vetoriais puros (SVG)
│   ├── icons.js            # Sistema integrado de ícones com SVG inline
│   └── bundle.js           # Bundle consolidado (execução offline e zero-CORS)
│
├── scripts/
│   └── build_bundle.js     # Script de compilação do bundle standalone
│
└── tests/                  # Suíte completa de 47 testes unitários
    ├── charts.test.js
    ├── clinical_features.test.js
    ├── edge_cases.test.js
    ├── enhancements.test.js
    ├── icons.test.js
    ├── layout_bundle.test.js
    └── store.test.js
```

---

## 🧪 Testes Automatizados

O projeto conta com **47 testes unitários** cobrindo regras contábeis, cálculo de atrasos D+90, bissexto, regimes de competência vs. caixa, simulador tributário, monitor de fadiga médica (CFM), integridade do Service Worker e layout do iPhone 16 Plus.

Para rodar os testes localmente:

```bash
node scripts/build_bundle.js
node --test tests/*.test.js
```

Resultado:
```text
✔ 47 pass
✔ 0 fail
✔ 100% das regras financeiras e clínicas validadas
```

---

## 🎨 Paleta de Cores & Design System

A identidade visual foi calibrada com foco em carinho, elegância e suavidade:

- **Rosa Suave Primário:** `#F48FB1`
- **Rosa Escuro / Acento:** `#EC407A`
- **Lilás Acolhedor:** `#CE93D8` / `#AB47BC`
- **Verde Menta (Entradas / Saldo):** `#26A69A`
- **Coral Pediátrico (Despesas / Atrasos):** `#FF7043`
- **Fundo Sanctuary:** `#FBF8FD`

---

Desenvolvido com carinho para simplificar e valorizar o trabalho das médicas pediatras! 🩺🌸
