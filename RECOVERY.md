# 🔄 RECOVERY — Finanças Pediatria (Guia de Restauração v4.0.0, v3.1.1, v3.1.0 & v2.0)

> **Pontos de Restauração Oficiais Disponíveis:**  
> - **v4.0.0 (Silk & Rose Gold — Macro-Grupos, Maternidades Rápidas, Silk Selects & Visual Hub)**: 107 testes aprovados (`recovery/snapshot_v4.0.0/`).  
> - **v2.0.0 (Nova Versão Pura, Higienizada & Sem Poluição)**: 94 testes aprovados (`recovery/snapshot_v2.0/`).  
> - **v3.1.1 (Anti-Crop Smart Select & Modal Scroll Safeguards)**: 85 testes aprovados (`recovery/snapshot_v3.1.1/`).  
> - **v3.1.0 (Pediatric Dark Sanctuary & Stitch Chic)**: 78 testes aprovados (`recovery/snapshot_v3.1.0/`).  
> - **v3.0.0 (Ultra Release - Consultório & DRE)**: 71 testes aprovados (`recovery/snapshot_v3.0.0/`).  
> - **v2.5.0 (Benchmark Inicial D+60/D+90)**: 59 testes aprovados (`recovery/snapshot_v2.5.0/`).  
> **Criado por:** FChNeto  
> **Finalidade:** Garantir recuperação rápida, segura e 100% automatizada a qualquer momento.

---

## 🛡️ Camadas de Proteção & Recuperação

O projeto dispõe de métodos independentes para restaurar snapshots estáveis a qualquer momento:

1. **Snapshot v3.1.1 (`recovery/snapshot_v3.1.1/`):** Contém todo o código-fonte com a arquitetura *In-Flow Expansion* anti-crop para dropdowns e seletores, rolagem garantida sem aprisionamento de toque em todos os modais, 6 regimes tributários completos, Pediatric Dark Sanctuary, Menu Hambúrguer, Foto de Perfil da Médica e Blindagem Jurídica (85 testes passando).
2. **Snapshot v3.1.0 (`recovery/snapshot_v3.1.0/`):** Contém o código com Pediatric Dark Sanctuary, Seletores Dropdown Modernos, Menu Hambúrguer e Foto de Perfil (78 testes passando).
3. **Snapshot v3.0.0 (`recovery/snapshot_v3.0.0/`):** Contém o marco v3.0.0 inicial com Consultório, SBAR e DRE (71 testes passando).
4. **Scripts de Restauração Automatizada:** `scripts/restore_v3.1.1.bat`, `scripts/restore_v3.1.1.js`, `scripts/restore_v3.1.1.ps1`.

---

## 🚀 Como Executar a Restauração para a Versão v3.1.1

### Método 1: Restauração em 1 Clique no Windows (Mais Rápido)
1. Navegue até a pasta de scripts do projeto:
   `c:\Users\chibe\OneDrive\Área de Trabalho\Antigravity\Nanda\scripts\`
2. Dê um duplo clique no arquivo:
   **`restore_v3.1.1.bat`**
3. Digite `S` e pressione Enter. O script restaurará os arquivos a partir do snapshot v3.1.1, recompilará o bundle e executará os 85 testes de validação!

---

### Método 2: Via Terminal Node.js (Recomendado para Devs e Agentes)
No terminal na raiz do projeto, execute:
```bash
npm run restore
```
Ou diretamente:
```bash
node scripts/restore_v3.1.1.js
```
O script executa em sequência:
- Restauração de todos os arquivos a partir de `recovery/snapshot_v3.1.1/`.
- Execução de `node scripts/build_bundle.js` para sincronizar o bundle standalone `js/bundle.js`.
- Execução dos 85 testes automatizados (`node --test tests/*.test.js`) validando 100% de sucesso.

---

### Método 3: Via Script PowerShell
No terminal PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/restore_v3.1.1.ps1
```

---

### Método 4: Cópia Manual do Snapshot
1. Abra a pasta `recovery\snapshot_v3.1.1\`.
2. Selecione todos os arquivos e pastas internos.
3. Copie e cole na raiz do projeto, substituindo os arquivos existentes.
4. Execute `npm test` para certificar-se de que todos os 85 testes estão verdes.

---

## 📦 Conteúdo Protegido no Snapshot v3.1.1

O snapshot em `recovery/snapshot_v3.1.1/` contém:
- Shell da aplicação e PWA (`index.html`, `manifest.json`, `sw.js`).
- Estilos, Anti-Crop e Dark Mode UTI (`css/styles.css`).
- Módulos JavaScript completos (`js/store.js`, `js/app.js`, `js/charts.js`, `js/icons.js`).
- Bundle standalone unificado zero-CORS (`js/bundle.js`).
- Scripts de compilação e restauração (`scripts/build_bundle.js`, `scripts/restore_v3.1.1.*`).
- Suíte completa de 85 testes automatizados (`tests/`).
- Documentação e memória do projeto (`README.md`, `RELEASE_NOTES.md`, `MEMORY.md`, `RECOVERY.md`, `package.json`).

---

*Finanças Pediatria — Desenvolvido com segurança e carinho por FChNeto.* 🩺✨🌸
