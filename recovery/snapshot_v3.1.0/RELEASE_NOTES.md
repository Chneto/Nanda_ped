# 🌸 Finanças Pediatria — Notas de Atualização (Release Notes)

> **Versão Oficial Atual: v3.1.0 (Pediatric Dark Sanctuary & Stitch Chic)**  
> **Criado por: FChNeto**  
> **Público-Alvo:** Médicas Pediatras, Residentes em Pediatria, Neonatologistas e Gestoras de Consultório  
> **Stack:** Vanilla Web (HTML5 Semântico, CSS3 Moderno, ES6+ Modular), PWA Offline-First, IndexedDB Dual-Engine, SVG Puro, Google Stitch Design System

---

## 🌟 Versão 3.1.0 (Pediatric Dark Sanctuary & Stitch Chic Release)

A versão **3.1.0** traz aprimoramentos fundamentais de usabilidade, conforto visual e conformidade jurídica solicitados pela médica:

### 🚀 Novidades & Melhorias da Versão 3.1.0

#### 1. 🌙 Pediatric Dark Sanctuary (Google Stitch Token Architecture)
- **Legibilidade Absoluta no Modo Escuro:** Resolução definitiva do problema de texto sem visibilidade no modo escuro.
- **Paleta Harmoniosa e Feminina:** Fundo em tons profundos de ameixa e vinho (`#150D1C`, `#1F1228`, `#2B1838`), acentuado com rosa vibrante (`#FF69B4`, `#EC407A`), lavanda (`#CE93D8`, `#E1BEE7`), menta (`#4DB6AC`) e coral (`#FF8A65`).
- **Contraste Tipográfico Impecável:** Textos principais em *Lavender Blush* (`#FFF0F5`, taxa de contraste > 14:1) e textos secundários em lilás suave (`#D8B4E2`), garantindo descanso visual durante turnos noturnos na UTI Neonatal.
- **Gráficos SVG Adaptativos:** Gráficos de barras, eixos e linhas de meta adaptados com cores claras e nítidas em tema escuro.

#### 2. 🎨 Dropdowns Modernos e Arredondados (Stitch Chic Selectors)
- **Eliminação de Menus Nativos Rústicos:** Substituição dos seletores quadrados nativos dos sistemas operacionais por menus suspensos customizados (`rounded-2xl` / 16-20px), idênticos ao seletor moderno de despesas.
- **Seletor de Hospitais & Locais de Trabalho:** Seletor Stitch arredondado com busca em tempo real, adição de novos locais em 1 toque, popover flutuante e pílulas rápidas (`Hospital Mater Dei`, etc.).
- **Filtros e Seletores Clínicos Integrados:** Seletor de Setor Clínico na visão de Plantões, Atuação Pediátrica, Setor Clínico, Tipo de Escala, Tipo de Despesa, Tipo de Atendimento, Puericultura, Duração, Pagamento e Regime Tributário no Onboarding.
- **Tipografia & Ícones Manrope:** Cada seletor conta com ícone temático, crachá, chevron animado e checkmark de seleção.
- **Compatibilidade Plena e Acessibilidade:** Manutenção de `<select>` nativo oculto sincronizado nos dois sentidos, preservando submissão de formulários e testes existentes.

#### 3. 🍔 Menu Hambúrguer & Gaveta Lateral Despoluída
- **Cabeçalho Limpo e Elegante:** Eliminação da poluição visual no topo da tela. A barra superior agora exibe de forma arejada o logotipo, alternador de tema, avatar da médica com foto e o botão hambúrguer (`☰`).
- **Gaveta Lateral de Gestão Completa:** Painel deslizante com efeito glassmorphic contendo:
  - Cartão de perfil da médica com foto, CRM e título.
  - Botões de utilidades (Notificações com badge, Modo Sigilo, Busca Spotlight, Alternador de Frame e Instalar PWA).
  - Atalhos de gestão rápida (DRE & Fator R, Conciliação OFX/CSV, Kit do Contador, SBAR Clínico, FIRE, Lixeira).
  - Botão de acesso ao Centro de Conformidade Jurídica.

#### 4. 📸 Envio de Foto de Perfil da Médica
- **Personalização Visual:** A médica pode enviar uma foto sua diretamente do celular ou computador.
- **Processamento no Navegador:** Corte centralizado quadrado automático, compressão otimizada em JPEG e armazenamento local seguro (Zero Cloud Leak).
- **Sincronização Instantânea de Avatares:** A foto atualiza imediatamente o cabeçalho superior, o menu hambúrguer e a caixa de diálogo de configurações.
- **Remoção e Reversão para Iniciais:** Botão de 1 toque no menu hambúrguer e no modal de perfil para remover a foto e restaurar as iniciais estilizadas da médica.

#### 5. ✨ Microinterações & Chuva de Partículas Pediátricas
- **Motor de Partículas Leve:** Efeito flutuante de corações delicados (`💖`, `💕`), borboletas (`🦋`) e brilhos estelares (`✨`, `🌸`) ao cadastrar plantões, registrar consultas ou despesas, e alternar temas.
- **Reações Visuais Acolhedoras:** Reações de bebê felizes e encorajadoras em todas as ações, sem imagens de bebês chorando desconfortáveis.

#### 6. ⚖️ Centro de Segurança Jurídica & Blindagem Profissional
- **Painel Jurídico Dedicado:** Modal com fundamentação jurídica detalhada para a médica:
  - **LGPD (Lei 13.709/18):** Arquitetura Local-First, ausência de vazamento em nuvem pública e anonimização nativa de pacientes.
  - **Código de Ética Médica (Resolução CFM nº 2.217/18):** Proteção irrestrita do sigilo médico (Arts. 73-79) com o Modo Sigilo.
  - **Resolução CFM nº 2.147/16:** Monitoramento de fadiga em plantões consecutivos de 12h/24h.
  - **Constituição Federal (Art. 5º, X/XII) & Código Civil (CC/02):** Inviolabilidade de dados e segurança nas deduções contábeis.

---

## 🌟 Versão 3.0.0 (Ultra Release — Produção & GitHub)

A versão **3.0.0** representa o maior salto qualitativo do **Finanças Pediatria**, transformando-o em um ecossistema completo de gestão financeira médica e inteligência contábil, integrando consultório particular, plantões hospitalares e proteção tributária avançada.

---

### 🚀 Novidades & Funcionalidades da Versão 3.0.0

#### 1. 👶 Módulo Nativo de Consultório & Acompanhamento de Puericultura
- **Gestão de Atendimentos:** Cadastro de consultas particulares avulsas e pacotes de puericultura do 1º ano de vida (RN, 2m, 4m, 6m, 9m, 12m).
- **Termômetro de Rentabilidade (Consultório vs Plantão):** Comparativo visual do rendimento por hora trabalhada (R$/h), comprovando a vantagem financeira das consultas particulares em relação aos plantões hospitalares.
- **Integração Plena:** Consultas integradas ao fluxo de caixa, DRE, lixeira e conciliação bancária.

#### 2. 🌙 Modo Noturno UTI Neonatal (Dark Mode de Alto Contraste)
- **Design Ergonômico Noturno:** Paleta escura profunda com contraste suave, desenvolvida especialmente para médicas em turnos noturnos na UTI Neonatal ou quartos hospitalares com baixa iluminação.
- **Alternância Dinâmica e Persistência:** Botão de alternância com ícones de sol e lua no cabeçalho superior e persistência automática da preferência no armazenamento local.

#### 3. 📈 Projeção Rolante de 12 Meses & Touch Scrubber Panorâmico
- **Visão Anual Contínua:** Projeção visual dos próximos 12 meses de fluxo de caixa em SVG interativo navegável por toque ou mouse.
- **Reserva Segura de 6 Meses:** Linha horizontal de proteção financeira indicando o patamar ideal de reserva de emergência para a pediatra.
- **Curva de Saldo Acumulado:** Linha suave com curva Bezier demonstrando a evolução patrimonial ao longo do ano.

#### 4. 📊 DRE Médica Completa & Otimizador Dinâmico do Fator R (28%)
- **Demonstrativo do Resultado do Exercício:** Faturamento bruto, impostos retidos, receita operacional líquida, despesas operacionais da PJ e superávit real.
- **Inteligência do Fator R (Lei Complementar 123/2006):** Monitora a razão entre Folha de Pagamento (Pró-labore + encargos) e Receita Bruta dos últimos 12 meses (RBT12), indicando o ajuste exato para manter a PJ no Anexo III (alíquota inicial de 6%) e evitar o Anexo V (15.5%), economizando de R$ 15.000 a R$ 40.000 anuais em impostos.

#### 5. 🩺 Passagem de Plantão SBAR (LGPD-Safe)
- **Estrutura Médica Padronizada:** Situação, Histórico (Background), Avaliação e Recomendações formatados profissionalmente.
- **Blindagem LGPD:** Higienização automática de nomes de pacientes e recém-nascidos para conformidade rigorosa com a LGPD.
- **Exportação Direta:** Envio formatado em 1 toque para o WhatsApp da equipe médica.

#### 6. 🏦 Extrator de Extratos Bancários (OFX & CSV) e Conciliação Inteligente
- **Suporte a Múltiplos Formatos:** Leitura direta no navegador de arquivos `.ofx` e `.csv` de qualquer banco brasileiro (Nubank, Inter, Itaú, Bradesco, Santander, etc.).
- **Conciliação Automatizada:** Reconhece repasses de plantões hospitalares (D+60/D+90), consultas pagas e despesas operacionais, permitindo dar baixa em lote com 1 toque.

#### 7. 💼 Kit do Contador em 1 Toque
- **Fechamento Contábil Mensal:** Gera um resumo executivo com faturamento bruto, despesas da PJ, pró-labore recomendado e saldo de caixa.
- **CSV Compatível com Excel Brasileiro:** Exportação formatada com UTF-8 BOM, ponto e vírgula como delimitador e vírgula decimal, pronto para envio direto ao contador via WhatsApp ou e-mail.

#### 8. 🔥 Simulador FIRE da Liberdade de Plantões (Termômetro de Liberdade)
- **Cálculo da Independência Financeira:** Meta patrimonial calculada pela regra dos 4% (25x os custos anuais de vida).
- **Plantões Eliminados:** Mede concretamente quantos plantões noturnos de 12 horas o rendimento passivo dos investimentos já consegue aposentar permanentemente por mês.

#### 9. 🎙️ Reconhecimento de Voz Médica com NLP em Português
- **Lançamento Falado Natural:** Ditado rápido de plantões e despesas usando termos médicos da rotina pediátrica (ex: *"Plantão de 12 horas ontem no Sabará, valor líquido 3200 reais"*).
- **Fallback Acolhedor:** Modal manual caso o navegador não disponha de permissão para o microfone.

#### 10. 🔍 Spotlight Search Universal (Cmd+K / Ctrl+K)
- **Busca Ultrarrápida:** Pesquisa instantânea por nome de hospital, tipo de plantão, paciente de puericultura, categoria ou descrição de despesa com atalhos de teclado e toque no cabeçalho.

#### 11. 🛡️ Blindagem contra Auto-Zoom no iOS Safari
- **Tamanho Mínimo de 16px:** Todos os formulários e campos de entrada receberam proteção CSS explícita contra o zoom automático incômodo do Safari no iPhone.
- **Meta Tag Resizes-Content:** Suporte moderno para redimensionamento de conteúdo quando o teclado virtual é acionado no celular.

#### 12. 💾 Armazenamento Dual-Engine L2 (PediatricSanctuaryDB)
- **Persistência Redundante:** Sincronização assíncrona com `IndexedDB` em segundo plano, servindo como camada secundária de segurança contra limpezas acidentais do cache do navegador.

#### 13. 🩺 Correção Clínica do Cálculo de Fadiga (Diretrizes CFM)
- **Cálculo Fiel da Carga Horária:** Considera a duração explícita de cada atendimento e plantão (6h, 12h, 24h ou consultas de 60 minutos), eliminando falsas atribuições de turnos longos e fornecendo alertas precisos sobre limites saudáveis de descanso.

---

## 📜 Histórico de Versões

### Versão 2.5.0
- Gestão livre de categorias de despesas e classificação PF vs PJ.
- Barra deslizante de alíquota de imposto (6% a 20%).
- Regra realista de parcelamento de plantões médicos: 80% D+60 e 20% D+90.
- Safe Area adaptativa para iPhone 16 Plus (Dynamic Island).
- Lixeira com recuperação e botão "Desfazer" em 1 toque.
- Reações afetivas visuais infantis (bebês sorridentes e acolhedores).
- Suíte inicial com 59 testes automatizados.

---

*Finanças Pediatria — Desenvolvido com carinho, rigor técnico e excelência por FChNeto.* 🩺✨🌸
