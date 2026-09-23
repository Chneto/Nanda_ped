# 🌸 Finanças Pediatria — Notas de Atualização (Release Notes)

> **Versão Oficial de Lançamento: v2.5.0**  
> **Criado por: FChNeto**  
> **Público-Alvo:** Médicas Pediatras, Residentes em Pediatria e Especialistas Neonatais  
> **Stack:** Vanilla Web (HTML5 Semântico, CSS3 Moderno, ES6+ Modular), PWA Offline-First, SVG Puro

---

## 🌟 Versão 2.5.0 (Produção / GitHub Release)

Esta versão consolida uma grande evolução de funcionalidades, usabilidade, estética e inteligência financeira médica, atendendo a todos os requisitos do cotidiano de uma pediatra com foco em acolhimento, alta precisão contábil e experiência mobile fluida.

---

### 🚀 Principais Novidades & Melhorias

#### 1. 🏷️ Gestão Livre & Dinâmica de Categorias de Despesas
- **Liberdade Total:** Agora você pode adicionar qualquer categoria personalizada de gastos (por exemplo: *Contador*, *Mercantil/Mercado*, *Lanches*, *Combustível*, etc.).
- **Escopo PF vs PJ:** Ao criar uma categoria, defina facilmente se ela pertence à **Pessoa Física** (vida pessoal) ou **Pessoa Jurídica** (consultório/plantões).
- **Busca Instantânea:** Menu suspenso estilizado com campo de busca em tempo real que filtra opções enquanto você digita.
- **Troca Rápida nos Cards:** Clique diretamente na etiqueta de categoria de qualquer despesa cadastrada para alternar sua categoria sem precisar abrir a tela cheia de edição.
- **Gerenciador de Categorias:** Painel no perfil para editar, renomear ou remover categorias personalizadas criadas.

#### 2. 🎨 Revisão Integral de UI/UX & Tipografia Unificada
- **Tipografia Harmonizada:** Todos os menus, formulários, selects e botões agora utilizam estritamente a fonte **'Manrope'** (corpo e formulários) e **'Bricolage Grotesque'** (títulos e valores financeiros).
- **Selects Customizados Temáticos:** Adeus menus nativos cinzas e desarmônicos do sistema. Todos os seletores agora contam com design exclusivo, cantos arredondados (ounded-2xl), sombreamento suave e chevron rosa pediátrico (#b80f55).
- **Acessibilidade e Contraste:** Melhoria nos contrastes de texto sobre fundos pastéis e lilases.

#### 3. 📱 Ajuste da Margem Superior / Safe Area (iPhone 16 Plus)
- **Zero Sobreposição:** O cabeçalho foi reprojetado para respeitar rigorosamente a *Dynamic Island*, recorte da câmera frontal e a barra de status do iOS.
- **Variável Adaptativa:** --safe-top: max(env(safe-area-inset-top, 0px), 52px) garantindo que as informações só comecem abaixo dos elementos nativos do dispositivo móvel.

#### 4. 💰 Regra de Pagamento de Plantão Fracionado (80% D+60 / 20% D+90)
- **Fórmula Realista da Rotina Médica:**
  - **80%** do valor líquido do plantão é projetado para recebimento em **60 dias (D+60)**.
  - **20%** restantes (completando o total) são projetados para **30 dias após (D+90)**.
- **Integração no Regime de Caixa:** Os relatórios de fluxo de caixa e o gráfico de projeção para os próximos 4 meses distribuem exatamente cada parcela em seu respectivo mês de vencimento.
- **Confirmação Independente:** Possibilidade de dar baixa em parcelas recebidas individualmente.

#### 5. 🎚️ Barra Deslizante de Alíquota Tributária (6% a 20%)
- **Slider Tipo Volume:** Controle intuitivo em barra corrida para ajuste rápido da alíquota de impostos sobre os plantões.
- **Cálculo Instantâneo:** Ao mover a barra, o valor líquido resultante é recalculado e exibido imediatamente na tela.
- **Sem Valores Fixos Prévios:** Campo de valor bruto do plantão limpo para que a médica informe exatamente o valor negociado no hospital/maternidade.

#### 6. 🏥 Locais & Vínculos de Trabalho Flexíveis
- **Locais Pré-Determinados:** *Maternidade Araken*, *Maternidade Leide Morais* e *MEJEC* já incluídos por padrão.
- **Novos Locais:** Campo rápido para cadastrar novos hospitais ou maternidades parceiras.
- **Tipos de Atuação:** Seletor de vínculos adaptável (Clínica, Serviço Público, Plantão em Maternidade, Plantão Hospitalar, etc.).

#### 7. 🗑️ Lixeira Segura & Desfazer Instantâneo (1-Tap Undo)
- **Proteção Contra Cliques Acidentais:** Exclusões de plantões, despesas ou salários geram um aviso flutuante imediato com botão *"Desfazer"*.
- **Histórico de Lixeira:** Modal dedicado para visualizar e restaurar itens apagados a qualquer momento, preservando os dados no localStorage.

#### 8. 👶 Reações Afetivas de Bebês
- **Microinterações Lúdicas:**
  - **Bebê Sorridente com Corações:** Disparado ao cadastrar receitas, salários ou confirmar o recebimento de plantões.
  - **Bebê Choroso e Carinhoso:** Disparado ao cadastrar despesas, estimulando o controle financeiro de forma acolhedora.
- **Imagens e SVGs Embutidos:** Imagens de alta definição na pasta ssets/images/ com fallbacks vetoriais em SVG caso o carregamento de rede seja interrompido.

#### 9. ✍️ Assinatura Oficial do Criador
- **Autoria Inviolável:** Registrado permanentemente no código-fonte via constante congelada APP_CREATOR = 'FChNeto'.
- **Exibição Elegante:** Badge permanente *"Criado por FChNeto"* no rodapé de todas as telas e no modal de Informações/Perfil.

#### 10. 🧪 Qualidade de Código & 59 Testes Automatizados
- **59 Testes Unitários:** 100% de aprovação no motor de datas, cálculo tributário, parcelamento D+60/D+90, bissexto, regimes contábeis, categorias PF/PJ, exportação CSV e layout do iPhone 16 Plus.
- **Zero-CORS Standalone Bundle:** O arquivo js/bundle.js garante funcionamento pleno mesmo em ambiente local (ile:///) e no GitHub Pages.

---

## 📅 Histórico de Versões

### 🌟 Versão 2.0.0
- **Visão em Modo Calendário:** Alternância entre listagem e calendário mensal de escala médica.
- **Modo Sigilo (Privacy Mode):** Botão estilo app bancário para mascarar saldos em público com 1 toque.
- **Simulador Tributário PJ vs PF:** Comparador entre Simples Nacional (Anexo III) e Carnê-Leão (27.5%) com cálculo do Fator R (28%).
- **Monitor de Fadiga & Bem-Estar (CFM):** Alertas preventivos contra sobrecarga de horas e plantões noturnos consecutivos.
- **Extrato Timbrado Pediátrico:** Impressão profissional e geração de PDF formatado para a contabilidade.
- **Troca de Plantão via WhatsApp:** Gerador de mensagens prontas para transferir escalas entre colegas.

### 🌟 Versão 1.0.0
- **Lançamento do Projeto PWA:** Arquitetura Single Page Application mobile-first.
- **Regime de Caixa vs. Regime de Competência:** Distinção contábil do mês trabalhado vs. mês depositado.
- **Motor de Plantões D+90:** Cálculo automático da data prevista de depósito.
- **Gráficos SVG Puros:** Gráfico de linha/área para projeção de 4 meses e gráfico de rosca de despesas por categoria.
- **Offline First:** Service Worker integrado com armazenamento persistente em localStorage.

---

*Finanças Pediatria — Desenvolvido com carinho e precisão médica por FChNeto.* 🩺🌸
