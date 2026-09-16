# 🌸 Finanças Pediatria — Gestão Financeira Pediátrica v3.0 (PWA)

![Finanças Pediatria Showcase](./assets/images/showcase.png)

[![Versão](https://img.shields.io/badge/Versão-3.0.0-EC407A?style=for-the-badge&logo=apple)](./RELEASE_NOTES.md)
[![Testes Automatizados](https://img.shields.io/badge/Testes-71%20Pass-26A69A?style=for-the-badge&logo=node.js)](./tests/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline--First-AB47BC?style=for-the-badge&logo=pwa)](./manifest.json)
[![Licença MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-blue?style=for-the-badge)](./LICENSE)
[![Criado por](https://img.shields.io/badge/Criado%20por-FChNeto-F48FB1?style=for-the-badge)](#-autoria--créditos)

> **Aplicação Web Mobile-First (PWA) de Controle Financeiro de Alta Performance criada sob medida para Médicas Pediatras.**  
> Gerenciamento inteligente de **Módulo Nativo de Consultório & Puericultura do 1º Ano**, **Plantões Médicos Fracionados (80% D+60 / 20% D+90)**, **Dark Mode UTI Neonatal**, **Projeção Rolante de 12 Meses com Scrubber Interativo**, **DRE Médica & Otimizador Dinâmico do Fator R (28%)**, **Passagem de Plantão SBAR LGPD-Safe**, **Conciliação Bancária OFX/CSV**, **Kit do Contador em 1 Toque**, **Simulador FIRE da Liberdade de Plantões**, **Lançamento por Voz Médica com NLP**, **Spotlight Search (Cmd+K)**, **Armazenamento Dual-Engine L2 IndexedDB** e **Blindagem contra Auto-Zoom no iOS**.

---

## 🩺 Destaques & Funcionalidades Principais da v3.0

| Recurso | Descrição |
| :--- | :--- |
| **👶 Módulo Consultório & Puericultura** | Acompanhamento completo dos atendimentos particulares e planos de puericultura do 1º ano de vida (RN, 2m, 4m, 6m, 9m, 12m), comparando rendimento horário (R$/h) com plantões. |
| **🌙 Modo Noturno UTI Neonatal (Dark Mode)** | Tema escuro refinado, ideal para plantões noturnos em UTIs e quartos escuros, com contraste suave, proteção ocular e persistência automática. |
| **📈 Projeção Rolante 12 Meses & Scrubber Touch** | Gráfico SVG panorâmico navegável por toque que projeta os próximos 12 meses de fluxo de caixa com linha de Reserva Segura de 6 Meses. |
| **📊 DRE Médica & Otimizador Fator R 28%** | Demonstrativo de Resultado do Exercício com cálculo em tempo real do Fator R (RBT12 vs Folha12) para manter a PJ no Anexo III (6%) e economizar milhares de reais em impostos. |
| **🩺 Passagem de Plantão SBAR (LGPD-Safe)** | Gerador profissional de handover clínico estruturado (Situação, Background, Avaliação, Recomendação) com proteção de dados de pacientes para envio via WhatsApp. |
| **🏦 Conciliação Bancária OFX & CSV** | Importe extratos de qualquer banco (Nubank, Itaú, Bradesco, Inter, Santander) e concilie automaticamente os repasses de plantões e pagamentos de despesas. |
| **💼 Kit do Contador em 1 Toque** | Gera resumo executivo completo e arquivo CSV compatível com Excel brasileiro (UTF-8 BOM) pronto para envio por WhatsApp ou e-mail ao contador da clínica. |
| **🔥 Simulador FIRE & Termômetro de Liberdade** | Calcula a independência financeira médica, indicando quantos plantões noturnos a médica pode eliminar permanentemente através dos rendimentos passivos. |
| **🎙️ Lançamento Rápido por Voz (NLP)** | Reconhecimento de voz em português brasileiro para cadastrar plantões e despesas falando naturalmente (ex: *"Plantão de 12 horas ontem no Mater Dei, valor dois mil reais"*). |
| **🔍 Spotlight Search Global (Cmd+K / Ctrl+K)** | Barra de pesquisa universal instantânea para encontrar qualquer plantão, consulta, paciente de puericultura, hospital ou despesa em milissegundos. |
| **🛡️ Blindagem contra Zoom Indesejado no iOS** | Campos de entrada ajustados com tamanho mínimo de 16px e meta tag `interactive-widget=resizes-content`, eliminando o incômodo zoom automático do Safari móvel. |
| **💾 Armazenamento Dual-Engine L2 (PediatricSanctuaryDB)** | Sincronização em tempo real entre `localStorage` e `IndexedDB`, garantindo tolerância a falhas e backup automático das finanças. |
| **🍼 Motor de Plantões Parcelados (80% D+60 / 20% D+90)** | Cálculo automático da rotina médica real: 80% creditado em 60 dias e 20% em 90 dias, projetando entradas precisas no fluxo de caixa. |
| **🏷️ Categorias Livres & Escopo PF/PJ** | Crie qualquer categoria que desejar (*Contador*, *Mercantil/Mercado*, *Lanches*, *Combustível*, etc.) e classifique entre Vida Pessoal (PF) ou Trabalho (PJ). |
| **🎚️ Barra Deslizante de Imposto (6% a 20%)** | Slider interativo estilo volume para definir a alíquota tributária desejada com recálculo instantâneo do valor líquido. |
| **🗑️ Lixeira Segura & Desfazer Imediato (1-Tap Undo)** | Exclusões acidentais de plantões, consultas, despesas ou salários podem ser desfeitas na hora via toast ou recuperadas na lixeira. |
| **👁️ Modo Sigilo (Privacy Mode)** | Oculte ou revele todos os saldos e valores da tela com 1 toque no cabeçalho (estilo app bancário), ideal para usar perto de colegas de plantão. |
| **✍️ Criado por FChNeto** | Assinatura oficial do desenvolvedor gravada no código-fonte e destacada no rodapé da aplicação. |

---

## 📱 Como Abrir e Instalar no Celular

Como a aplicação é um **PWA (Progressive Web App)** de última geração, ela não requer download em lojas de apps:

### 🍎 No iPhone ou iPad (Safari)
1. Abra o link da aplicação no navegador **Safari**.
2. Toque no botão de **Compartilhar** (ícone de quadrado com a seta para cima ⎋ na barra inferior do Safari).
3. Role para baixo e toque em **"Adicionar à Tela de Início"** (ícone de ➕).
4. Toque em **"Adicionar"** no canto superior direito.
5. O app **Finanças Pediatria** abrirá em tela cheia como um aplicativo nativo.

### 🤖 No Android (Google Chrome)
1. Abra o link da aplicação no navegador **Google Chrome**.
2. Toque no menu de **três pontinhos** (⋮) no canto superior direito.
3. Selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.
4. Confirme a instalação.

---

## 🧪 Suíte de Testes Automatizados (100% Cobertura)

A aplicação conta com **71 testes automatizados rigorosos** executados nativamente via Node.js Test Runner:

```bash
# Executar a suíte de testes e compilar o bundle
npm test
```

### Arquivos de Teste:
- `tests/v3_features.test.js` — Validação de todas as 14 novas funcionalidades da V3.0.
- `tests/clinical_features.test.js` — Validação de Fadiga CFM, cálculos tributários e relatórios.
- `tests/pediatric_enhancements.test.js` — Validação da lixeira, parcelamento D+60/D+90 e categorias.
- `tests/edge_cases.test.js` — Anos bissextos, fuso horário UTC-3, valores negativos e tolerâncias.
- `tests/layout_bundle.test.js` — Validação visual, responsividade iPhone 16 Plus e execução do bundle zero-CORS.

---

## 🔄 Recuperação e Restauração de Desastres (Disaster Recovery)

A aplicação inclui snapshots estáveis completos e scripts de recuperação em 1 clique:

- **Windows:** Duplo-clique em `scripts/restore_v3.0.0.bat`
- **PowerShell:** `powershell -ExecutionPolicy Bypass -File scripts/restore_v3.0.0.ps1`
- **Node.js:** `npm run restore` ou `node scripts/restore_v3.0.0.js`

Consulte o arquivo [RECOVERY.md](./RECOVERY.md) para instruções detalhadas.

---

## 👨‍💻 Autoria & Créditos

**Finanças Pediatria** foi idealizado, desenhado e desenvolvido por **FChNeto**.  
*Dedicado com carinho e admiração a todas as pediatras que cuidam com dedicação e amor da vida das nossas crianças.* 🩺✨🌸
