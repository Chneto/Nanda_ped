# 🩺 CONTEXT — Contexto de Negócio, Domínio Médico & Arquitetura Técnica

> **Dossiê Completo de Contexto para Compreensão Aprofundada do Sistema.**  
> **Aplicação:** Finanças Pediatria  
> **Autoria:** **FChNeto** (`APP_CREATOR = 'FChNeto'`)  
> **Usuária-Foco:** Dra. Fernanda Ch. (Médica Pediatra)  

---

## 👩‍⚕️ 1. A Persona Médica & Rotina Hospitalar

### Quem é a Médica Pediatra?
A **Dra. Fernanda Ch.** é uma médica pediatra e residente que atua na linha de frente do atendimento infantil e neonatal em maternidades e hospitais de referência (como Maternidade Araken, Maternidade Leide Morais, MEJEC, Hospital da Criança, Mater Dei, Promater).

### A Rotina Real do Trabalho:
- **Jornada Extenuante:** Plantões de 12 horas diurnos, 12 horas noturnos e plantões de 24 horas contínuos.
- **Ambientes de Alta Criticidade:** Sala de Parto (reanimação neonatal em minutos cruciais de ouro), UTI Neonatal (recém-nascidos prematuros extremos), Pronto-Socorro Infantil e Enfermarias Pediátricas.
- **Carga Mental e Emocional:** Tomadas de decisão sob extrema pressão médica, acolhimento de famílias angustiadas e vigilância contínua.
- **O Desafio Tecnológico:** Em meio ao cansaço dos pós-plantões, ela não tem tempo nem paciência para planilhas de Excel complexas, aplicativos bancários cheios de anúncios ou sistemas contábeis burocráticos. O software financeiro precisa ser um **santuário de acolhimento**, rápido como um toque no celular e visualmente repousante para os olhos.

---

## 💰 2. O Domínio Financeiro Médico & O Problema do Fluxo de Caixa

```
+-------------------------------------------------------------------------------+
|                    DINÂMICA DE RENDIMENTOS DA PEDIATRA                        |
+-------------------------------------------------------------------------------+
|  1. Bolsa Residência Médica (MEC) -> R$ 4.106,09 (Fixo, todo dia 5)          |
|  2. Plantões em Sala de Parto      -> Valor Variável (80% D+60 / 20% D+90)    |
|  3. Consultório Particular         -> Consultas e Puericultura 1º Ano         |
+-------------------------------------------------------------------------------+
```

### O Desafio Central: A Ilusão da Competência vs. A Realidade do Caixa
A maioria dos médicos sofre financeiramente não pela falta de faturamento, mas pela **defasagem temporal dos recebimentos**:
1. **O Trabalho Ocorre Hoje:** A médica atende recém-nascidos na Sala de Parto em Junho.
2. **As Contas Vencem em Julho:** Aluguel, energia, alimentação, parcelas de estudos e combustível precisam ser pagos pontualmente em 30 dias.
3. **O Pagamento dos Plantões é Postergado (Regra D+60 e D+90):**
   - As cooperativas médicas e hospitais conveniados faturam os repasses com atraso padrão:
     - **80% do valor líquido:** Creditado somente **60 dias após (D+60)**.
     - **20% restantes:** Creditados **90 dias após (D+90)**.
4. **Consequência:** Se a médica olhar apenas o quanto "produziu" no mês (Regime de Competência), terá a falsa sensação de saldo sobrando, enquanto sua conta bancária real pode entrar no cheque especial antes dos repasses caírem.
5. **Solução do Sistema:** O Finanças Pediatria projeta com rigor o **Regime de Caixa**, mostrando exatamente em quais meses futuros as parcelas de cada plantão cairão na conta, permitindo que a médica planeje despesas e compras parceladas sem sobressaltos.

---

## 🏷️ 3. As 22 Categorias Canônicas de Gastos da Médica

A versão v2.0 pré-configura e categoriza rigorosamente os 22 tipos de gastos solicitados:

| Categoria | Ícone & Identidade | Finalidade Prática no Cotidiano da Pediatra |
| :--- | :--- | :--- |
| **Passagens** | ✈️ Roxo Suave | Viagens para congressos de pediatria e visitas familiares. |
| **Mercantil** | 🛒 Verde Menta | Compras de supermercado, feira e abastecimento da casa. |
| **Academia** | 🏋️‍♀️ Rosa Suave | Atividade física para sustentação postural e alívio do estresse médico. |
| **Estudo** | 📖 Azul Céu | Livros médicos (Nelson Tratado de Pediatria), manuais e artigos científicos. |
| **Cursos** | 🎓 Índigo | Cursos de suporte avançado pediátrico (PALS, Reanimação Neonatal). |
| **Presentes** | 🎁 Lilás Médio | Presentes para familiares, afilhados e datas comemorativas. |
| **Aluguel** | 🏠 Vermelho Coral | Moradia e taxa de condomínio mensal. |
| **Energia** | ⚡ Laranja | Conta de energia elétrica residencial. |
| **Internet** | 🌐 Azul Claro | Conexão banda larga essencial para estudos médicos e telemedicina. |
| **Combustível** | ⛽ Laranja Queimado | Deslocamento entre hospitais, maternidades e consultório. |
| **Qualificação/Congresso/Pós** | 🩺 Roxo Real | Inscrições no Congresso Brasileiro de Pediatria (SBP), pós-graduações e títulos de especialista. |
| **Cosméticos** | 💄 Rosa Claro | Produtos de higiene e cuidados pessoais pós-plantão. |
| **Água** | 💧 Ciano | Tarifa de saneamento e água. |
| **Lanches** | 🥪 Amarelo Ouro | Alimentação rápida e café durante plantões noturnos. |
| **Doação** | 💖 Rosa Escuro | Contribuições sociais e causas beneficentes infantis. |
| **Refeição** | 🍲 Pêssego | Almoço e jantar diários fora de casa ou no hospital. |
| **Beleza/Salão** | 💇‍♀️ Magenta | Cuidados com cabelo, unhas e estética. |
| **Uber** | 🚗 Cinza Ardósia | Transporte por aplicativo quando sai cansada de plantões noturnos. |
| **Remédios** | 💊 Verde Folha | Farmácia, medicamentos de uso contínuo e bem-estar. |
| **Compras Parceladas** | 💳 Marrom Suave | Equipamentos de estudo, eletrônicos e compras faturadas no cartão. |
| **Saídas** | 🍷 Roxo Violeta | Lazer, jantares com amigos e momentos de desconexão. |
| **Delivery** | 🛵 Laranja Intenso | Pedidos de comida rápida (iFood) após escalas exaustivas. |
| **Produtos de beleza** | ✨ Rosa Claro | Dermocosméticos e cuidados com a pele. |

---

## ⚖️ 4. O Cenário Tributário Médico Brasileiro (Simples Nacional & Fator R)

O aplicativo foi projetado conhecendo a realidade fiscal dos médicos no Brasil:
1. **Atuação como Pessoa Física (PF):**
   - Altamente desvantajosa: imposto de renda de até **27,5%** via carnê-leão + **20%** de INSS autônomo (limitado ao teto).
2. **Atuação como Pessoa Jurídica (PJ Médica):**
   - A maioria dos hospitais privados e operadoras exige contratação via PJ médica.
3. **O Dilema do Simples Nacional (Anexo V vs. Anexo III):**
   - **Anexo V (Sem Fator R):** Alíquota inicial de **15,5%** sobre todo o faturamento da clínica.
   - **Anexo III (Com Fator R):** Alíquota reduzida inicial de apenas **6,0%**!
4. **A Regra dos 28% do Fator R:**
   $$\text{Fator R} = \frac{\text{Folha de Salários / Pró-labore dos últimos 12 meses (Folha12)}}{\text{Receita Bruta dos últimos 12 meses (RBT12)}} \ge 0,28$$
   - O aplicativo calcula dinamicamente o valor exato de pró-labore que a médica deve recolher para atingir a proporção de 28%, gerando uma economia de dezenas de milhares de reais anuais em impostos de forma 100% legal.

---

## 🏗️ 5. Anatomia Arquitetural do Repositório

```
nanda/
├── v2.0/                           # NOVA VERSÃO: SANCTUARY MINIMALIST
│   ├── index.html                  # Shell HTML5 limpo, seguro para iPhone
│   ├── manifest.json               # Configuração PWA standalone
│   ├── sw.js                       # Service Worker com cache offline nativo
│   ├── css/
│   │   └── styles.css              # Tokens Pediatric Chic, Safe Areas e Dark Mode
│   ├── js/
│   │   ├── app.js                  # Controlador SPA (3 abas + modal FAB)
│   │   ├── store.js                # Motor financeiro, D+60/D+90, 22 categorias, persistência
│   │   ├── charts.js               # Gráficos SVG puros (Previsão 6 meses + Rosca)
│   │   └── icons.js                # Ícones inline SVG seguros
│   └── assets/icons/               # Ícones de alta resolução para iOS e PWA
│
├── index.html                      # VERSÃO AVANÇADA (v3.1.1 Master Executive)
├── css/styles.css                  # Folha de estilos completa com In-Flow Expansion
├── js/
│   ├── app.js                      # Controlador completo (Consultório, DRE, SBAR, FIRE)
│   ├── store.js                    # Motor completo com módulo de puericultura
│   ├── charts.js                   # Gráficos avançados (12M scrubber, roscas)
│   ├── icons.js                    # Biblioteca geral de ícones
│   └── bundle.js                   # Bundle compilado de produção
│
├── tests/                          # 94 TESTES AUTOMATIZADOS (0 FALHAS)
│   ├── v2_suite.test.js            # Suíte dedicada do Finanças Pediatria v2.0
│   ├── select_crop_fix.test.js     # Validações anti-crop e scroll de modais
│   ├── v3_1_pediatric_sanctuary.test.js # Validações de tema escuro e gaveta lateral
│   └── [demais testes]             # Cálculos D+60/D+90, CFM, FIRE, DRE, SBAR, OFX
│
├── recovery/                       # PONTOS DE RESTAURAÇÃO OFICIAIS
│   ├── snapshot_v2.0/              # Snapshot congelado da v2.0
│   ├── snapshot_v3.1.1/            # Snapshot congelado da v3.1.1
│   ├── snapshot_v3.1.0/            # Snapshot congelado da v3.1.0
│   └── snapshot_v3.0.0/            # Snapshot congelado da v3.0.0
│
├── MEMORY.md                       # Memória canônica do sistema para IAs
├── RECOVERY.md                     # Guia de restauração e snapshots
├── ROADMAP.md                      # Visão de produto e próximos horizontes
├── AGENTS.md                       # Protocolo operacional para agentes autônomos
└── CONTEXT.md                      # Este dossiê completo de contexto
```

---

## 🔒 6. Por que o Aplicativo Funciona de Forma Tão Estável no iPhone?

1. **Eliminação de Dependências Frágeis:** Não depende de servidores backend remotos para cálculos, bancos de dados na nuvem que exigem login, nem CDNs de fontes externas que quebram ícones.
2. **Arquitetura de Armazenamento Triplo:**
   - O iOS Safari limpa o armazenamento local se o site ficar inativo por mais de 7 dias. O Finanças Pediatria supera isso combinando `IndexedDB` assíncrono perene + `localStorage` síncrono + `navigator.storage.persist()`.
   - Oferece o botão **"Salvar no Meu iPhone"**, que usa a API nativa de compartilhamento do iOS para permitir que a médica guarde o arquivo `.json` de backup dentro de pastas do iCloud ou localmente no app "Arquivos".
3. **Imunidade contra Auto-Zoom:** Todos os inputs possuem tamanho mínimo de `16px`, eliminando o comportamento do Safari móvel de dar zoom e desalinhar a tela.

---

*Com este contexto consolidado, qualquer agente ou engenheiro possui a visão completa de produto, rotina médica, normas contábeis e engenharia de software para evoluir o sistema com precisão e afeto.* 🌸🩺✨
