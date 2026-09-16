# 🩺 PLANO DIRETOR DE EVOLUÇÃO & AUDITORIA TÉCNICA (v2.5.0 → v3.0 ULTRA)
## Finanças Pediatria — PWA Mobile-First para Médica Pediatra
> **Autor & Criador Imutável:** FChNeto (`APP_CREATOR = 'FChNeto'`)  
> **Data:** Setembro de 2026  
> **Status da Base:** 59/59 Testes Aprovados (100% verde) | Standalone Bundle Zero-CORS

---

## 🔍 1. Vistoria Técnica & Auditoria do Código Atual (v2.5.0)

A vistoria profunda confrontou a arquitetura em produção com as exigências de usabilidade real de uma médica pediatra, identificando pontos fortes e oportunidades críticas:

### 1.1 Diagnóstico de Gargalos & Oportunidades Identificadas:
1. **Armazenamento no LocalStorage (Teto de 5MB):**
   - Atualmente, toda a persistência ocorre via `localStorage` síncrono. No Safari iOS, o limite rígido é de 5MB. A longo prazo, com recibos ou grande volume de lançamentos, o app corre risco de `QuotaExceededError`.
   - *Solução:* Arquitetura **Dual-Engine (L1 Cache em Memória/LocalStorage síncrono + L2 IndexedDB assíncrono)**, garantindo compatibilidade retroativa com os 59 testes e espaço de até 1GB para anexos e documentos.
2. **Bug Clínico de Fadiga CFM com Consultas Curtas:**
   - Em `store.js` (`getDoctorWellbeingMetrics`), plantões sem correspondência em `SHIFT_TYPES` sofrem fallback automático para 12h ou 24h. Se a médica lançar atendimentos particulares de 1h como plantão, o app superestima a carga horária e dispara falsos alarmes de fadiga.
   - *Solução:* Criação do módulo e entidade nativa `consultations` (Consultório Particular & Puericultura).
3. **Auto-Zoom Indesejado no Safari iOS (Inputs < 16px):**
   - Inputs com tamanho de fonte inferior a 16px acionam zoom automático forçado no Safari do iPhone, quebrando temporariamente a moldura de 430px.
   - *Solução:* Padronização de `font-size: 16px` em todos os campos de texto/número/select no mobile.
4. **Densidade do Gráfico de Previsão:**
   - O gráfico de projeção de plantões atual foca em 4 meses. Para expandir para 12 meses sem colisão de textos no SVG de 360px, é necessário implementar um contêiner horizontal deslizante com **Scrubber Tátil** e tooltip interativo.
5. **Apuração do Fator R Legal:**
   - O simulador atual calcula 28% sobre o faturamento do mês isolado. Na legislação tributária real (LC 123/2006), o Fator R é apurado com base no **RBT12 (Receita Bruta dos últimos 12 meses)** e **Folha12**.

---

## 🏛️ 2. Os 5 Pilares de Evolução (v3.0 Ultra)

Inspirado nos melhores apps de finanças e medicina do mundo (**Nubank, Monarch Money, Copilot Money, Medscape, Whitebook, Flo Health, Apple Health**):

```
+----------------------------------------------------------------------------------------------------+
|                                      FINANÇAS PEDIATRIA v3.0                                       |
+----------------------------------------------------------------------------------------------------+
| PILAR 1: Engenharia & Armazenamento  | PILAR 2: Layout & Design Sanctuary | PILAR 3: UX & Voz      |
| Dual-Engine L1/L2 (IndexedDB+Local)  | Dark Mode "Plantão Noturno"        | Onboarding Dra.        |
| Build Pipeline Robusto & JSDoc       | Haptic Híbrido Real (iOS Switch)   | Universal Cmd+K        |
| Offline Zero-CDN & WebP Assets       | Fix Auto-Zoom iOS (font 16px)      | Lançamento de Voz NLP  |
+--------------------------------------+------------------------------------+------------------------+
| PILAR 4: Inteligência Tributária     | PILAR 5: Módulo Clínico & Puericultura                      |
| DRE Pediátrico & Fator R (RBT12)     | Consultório Particular & Puericultura (sem distorcer CFM)  |
| Fluxo 12M Interativo com Scrubber    | Passagem de Plantão SBAR (LGPD-Safe)                        |
| Simulador FIRE Médico & Desaceleração| Conciliação OFX/CSV + Kit Contador em 1-Clique              |
+----------------------------------------------------------------------------------------------------+
```

---

### PILAR 1: Engenharia de Código, Arquitetura & Armazenamento de Dados

1. **Camada Dual-Engine de Armazenamento:**
   - **L1 (Síncrono):** In-Memory / `localStorage` para carregamento imediato (< 1.5ms) e execução perfeita dos testes unitários.
   - **L2 (Assíncrono):** `IndexedDB` em segundo plano para armazenamento massivo (recibos em imagem, PDFs de NFes e extratos bancários).
2. **Otimização Offline & Independência Absoluta:**
   - Substituição do Tailwind Play CDN em runtime por CSS estático pré-processado, eliminando dependência de rede em subsolos de hospitais.
   - Conversão de imagens de alta definição para **WebP** otimizado (-89% de tamanho).
3. **Modularização Segura do Controlador (`app.js`):**
   - Separação em submódulos lógicos (`ui-shifts.js`, `ui-expenses.js`, `ui-reports.js`, `ui-consultations.js`, `services-reconcile.js`) mantendo o script `build_bundle.js` sincronizado para compilação unificada zero-CORS.

---

### PILAR 2: Layout & Design System Stitch ("Pediatric Sanctuary")

1. **Dark Mode Temático ("Plantão Noturno / UTI Neonatal"):**
   - Tema escuro calmante projetado para uso durante a madrugada em enfermarias e alojamento conjunto, sem ofuscar os recém-nascidos e protegendo a visão da médica (`--bg-app: #0d0f18`, `--card-bg: #161826`).
2. **Sistema Háptico Híbrido para iPhone e Android:**
   - Feedback tátil mecânico em botões de confirmação de recebimento, exclusão e sliders no iOS e Android.
3. **Correção de Auto-Zoom no iOS:**
   - Garantia de `font-size: 16px` em todos os inputs e inclusão de `interactive-widget=resizes-content` para adaptação suave ao teclado virtual.
4. **Transições de Tela Fluidas (View Transitions API):**
   - Transições cinematográficas entre abas e cartões de plantão estilo aplicativo nativo do iOS.

---

### PILAR 3: UX/UI & Experiência da Médica Pediatra

1. **Onboarding Guiado ("Boas-vindas, Dra."):**
   - Passo a passo de 3 telas para médicas recém-chegadas: Nome/CRM, Hospitais habituais e Alíquota fiscal média.
2. **Busca Universal Inteligente (Spotlight Pediátrico / Cmd+K):**
   - Busca em tempo real por aproximação (*fuzzy search*) em todo o histórico de plantões, despesas, hospitais e atalhos rápidos do sistema.
3. **Lançamento Rápido por Comando de Voz Pós-Plantão (Web Speech API):**
   - Lançamento sem esforço ao sair do hospital: *"Plantão de ontem no Araken doze horas dois mil reais Simples seis por cento"*. O parser NLP interpreta e preenche o formulário automaticamente.
4. **Gestos Táteis (Swipe-to-Action):**
   - Deslizar card para a direita: marca como "Recebido"; deslizar para a esquerda: edita ou envia para a lixeira com 1-tap undo.

---

### PILAR 4: Cálculos Financeiros, Tributários & Modelagem Pediátrica Avançada

1. **Projeção Rolante de 12 Meses com Scrubber Interativo:**
   - Gráfico expansível com linha temporal de 1 ano, curva de saldo de caixa acumulado e linha de segurança financeira (Reserva de Emergência).
2. **DRE Pediátrico Completo (Demonstrativo de Resultado):**
   - Relatório estruturado de Faturamento Bruto → Impostos → Custos Operacionais Médicos (CRM, seguros, jalecos) → Margem de Contribuição → Pró-Labore → Despesas Pessoais → Taxa de Poupança Real.
3. **Otimizador Dinâmico do Fator R (RBT12 vs Folha12):**
   - Cálculo contábil exato dos últimos 12 meses indicando se a médica está no Anexo III (6%) ou em risco de cair no Anexo V (15,5%), calculando o pró-labore de menor custo tributário.
4. **Simulador FIRE Médico (Independência & Desaceleração):**
   - Termômetro visual de liberdade de plantões: indica quantos plantões a médica pode dispensar por mês com base no patrimônio e rendimentos acumulados.

---

### PILAR 5: Módulo Clínico, Consultório & Ecossistema Contábil

1. **Módulo de Consultório Particular & Puericultura:**
   - Entidade própria para consultas e planos de puericultura (acompanhamento do 1º ano de vida do bebê), permitindo comparar o ganho por hora no consultório vs. no plantão.
2. **Passagem de Plantão Estruturada (SBAR LGPD-Safe):**
   - Gerador de resumo clínico de passagem de plantão no padrão internacional SBAR (*Situation, Background, Assessment, Recommendation*), sem dados pessoais de pacientes e pronto para copiar para o WhatsApp da colega.
3. **Conciliação Bancária de Extratos OFX e CSV (Client-Side Puro):**
   - Importação de extratos bancários PJ (Itaú, Inter, Nubank, Cora) processados 100% no navegador da médica, sugerindo baixa automática de parcelas de 80% D+60 e 20% D+90 correspondentes.
4. **Kit do Contador em 1-Clique:**
   - Exportação no dia 1º de cada mês com CSV formatado para Excel, PDF executivo e texto pronto para envio ao WhatsApp da contabilidade.

---

## 📊 3. Matriz de Priorização (Roadmap Executivo)

| Pacote | Entregas | Foco |
| :--- | :--- | :--- |
| **P0 (Imediato)** | • Correção do cálculo de horas no CFM e entidade Consultório<br>• Dark Mode "Plantão Noturno / UTI Neonatal"<br>• Fix de Auto-Zoom no Safari iOS (`font-size: 16px`)<br>• Camada Dual-Engine L1/L2 (IndexedDB + LocalStorage) | Estabilidade, Ergonomia Noturna e Fundação de Dados |
| **P1 (Curto Prazo)** | • Gráfico de 12 Meses com Scrubber Tátil e Saldo Acumulado<br>• Busca Universal Spotlight (Cmd+K)<br>• DRE Pediátrico Mensal e Anual<br>• Lançamento Rápido por Voz com NLP Médico<br>• Otimizador Dinâmico do Fator R (RBT12) | Inteligência Contábil & Usabilidade Ágil |
| **P2 (Médio Prazo)** | • Conciliação Bancária OFX/CSV Client-Side<br>• Kit do Contador em 1-Clique (ZIP + WhatsApp)<br>• Passagem de Plantão SBAR LGPD-Safe<br>• Simulador FIRE Médico e Desaceleração<br>• Onboarding Guiado em 3 Passos | Eficiência Clínica & Liberdade Profissional |

---

## 🔒 4. Cláusulas Imutáveis de Preservação
- **Assinatura do Autor:** `APP_CREATOR = 'FChNeto'` e *"Criado por FChNeto"* permanecem intactos em todas as telas e no código.
- **Identidade Visual:** Paleta *Pediatric Sanctuary* (rosa, lilás, menta e coral) preservada e honrada.
- **Aprovação nos Testes:** 100% de taxa de sucesso nos testes automatizados a cada entrega.
