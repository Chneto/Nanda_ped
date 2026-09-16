# 🔄 RECOVERY — Finanças Pediatria (Guia de Restauração v3.1.0 & v3.0.0)

> **Pontos de Restauração Oficiais:**  
> - **v3.1.0 (Pediatric Dark Sanctuary & Stitch Chic)**: 78 testes aprovados (`recovery/snapshot_v3.1.0/`).  
> - **v3.0.0 (Ultra Release)**: 71 testes aprovados (`recovery/snapshot_v3.0.0/`).  
> **Criado por:** FChNeto  
> **Finalidade:** Garantir restauração rápida e 100% automatizada a qualquer momento.

---

## 🛡️ Camadas de Proteção & Recuperação

O projeto dispõe de métodos independentes para restaurar snapshots estáveis a qualquer momento:

1. **Snapshot v3.1.0 (`recovery/snapshot_v3.1.0/`):** Contém todo o código-fonte com Pediatric Dark Sanctuary, Seletores Dropdown Modernos, Menu Hambúrguer, Foto de Perfil e Central de Blindagem Jurídica (78 testes passando).
2. **Snapshot v3.0.0 (`recovery/snapshot_v3.0.0/`):** Contém o marco v3.0.0 inicial com Consultório, SBAR e DRE (71 testes passando).
3. **Scripts de Restauração Automatizada:** `scripts/restore_v3.0.0.bat`, `scripts/restore_v3.0.0.js`, `scripts/restore_v3.0.0.ps1`.

---

## 🚀 Como Executar a Restauração

### Método 1: Restauração em 1 Clique no Windows (Mais Rápido)
1. Navegue até a pasta de scripts do projeto:
   `c:\Users\chibe\OneDrive\Área de Trabalho\Antigravity\Nanda\scripts\`
2. Dê um duplo clique no arquivo:
   **`restore_v3.0.0.bat`**
3. Digite `S` e pressione Enter. O script restaurará os arquivos a partir do snapshot v3.0.0, recompilará o bundle e executará os 71 testes de validação!

---

### Método 2: Via Terminal Node.js (Recomendado para Devs e Agentes)
No terminal na raiz do projeto, execute:
```bash
npm run restore
```
Ou diretamente:
```bash
node scripts/restore_v3.0.0.js
```
O script executa em sequência:
- Restauração de todos os arquivos a partir de `recovery/snapshot_v3.0.0/`.
- Execução de `node scripts/build_bundle.js` para sincronizar o bundle standalone `js/bundle.js`.
- Execução dos 71 testes automatizados (`node --test tests/*.test.js`) validando 100% de sucesso.

---

### Método 3: Via Script PowerShell
No terminal PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/restore_v3.0.0.ps1
```

---

### Método 4: Cópia Manual do Snapshot
1. Abra a pasta `recovery\snapshot_v3.0.0\`.
2. Selecione todos os arquivos e pastas internos.
3. Copie e cole na raiz do projeto, substituindo os arquivos existentes.
4. Execute `npm test` para certificar-se de que todos os 71 testes estão verdes.

---

## 📦 Conteúdo Protegido no Snapshot v3.0.0

O snapshot em `recovery/snapshot_v3.0.0/` contém:
- Shell da aplicação e PWA (`index.html`, `manifest.json`, `sw.js`).
- Estilos e Dark Mode UTI (`css/styles.css`).
- Módulos JavaScript completos (`js/store.js`, `js/app.js`, `js/charts.js`, `js/icons.js`).
- Bundle standalone unificado zero-CORS (`js/bundle.js`).
- Ativos gráficos e ícones PWA (`assets/`).
- Scripts de compilação e restauração (`scripts/build_bundle.js`, `scripts/restore_v3.0.0.*`).
- Suíte completa de 71 testes automatizados (`tests/`).
- Documentação e memória do projeto (`README.md`, `RELEASE_NOTES.md`, `MEMORY.md`, `PLANO_DIRETOR_V3.md`, `LICENSE`, `package.json`).

---

*Finanças Pediatria — Desenvolvido com segurança e carinho por FChNeto.* 🩺✨🌸
