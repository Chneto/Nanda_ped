# 🔄 RECOVERY — Finanças Pediatria (Guia de Restauração v2.5.0)

> **Ponto de Restauração Oficial:** v2.5.0  
> **Criado por:** FChNeto  
> **Finalidade:** Permitir retornar a qualquer momento para esta versão estável caso modificações, testes ou atualizações futuras causem inconsistências ou bugs.

---

## 🛡️ Camadas de Proteção & Recuperação

O projeto possui **4 métodos independentes** para restaurar a versão v2.5.0:

1. **Método 1: Restauração em 1 Duplo-Clique (Windows):** Sem precisar abrir terminal.
2. **Método 2: Script Automatizado Node.js (
pm run restore):** Restaura arquivos, reconstrói o bundle e roda os testes.
3. **Método 3: Via Git (Branch de Backup ou Tag):** Restauração direta via controle de versão Git.
4. **Método 4: Cópia Manual do Snapshot (ecovery/snapshot_v2.5.0):** Backup físico preservado no repositório.

---

## 🚀 Como Executar a Restauração

### Método 1: Restauração em 1 Clique no Windows (Mais Fácil)
1. Abra a pasta do projeto no Windows Explorer:
   c:\Users\chibe\OneDrive\Área de Trabalho\Antigravity\Nanda\scripts\
2. Dê um duplo clique no arquivo:
   **estore_v2.5.0.bat**
3. Confirme pressionando S e Enter. O script fará a cópia dos arquivos, recompilará o bundle e executará os 59 testes de validação automaticamente!

---

### Método 2: Via Terminal Node.js (Recomendado para Devs e Agentes)
No terminal, dentro da pasta do projeto, execute:
`ash
npm run restore
`
Ou diretamente:
`ash
node scripts/restore_v2.5.0.js
`
O script:
- Restaura todos os arquivos a partir de ecovery/snapshot_v2.5.0/.
- Executa 
ode scripts/build_bundle.js para garantir integridade do bundle standalone.
- Executa os 59 testes automatizados (
ode --test tests/*.test.js) validando 100% de sucesso.

---

### Método 3: Via Git (Terminal ou GitHub Desktop)

No Git foram criados pontos de restauração imutáveis:

#### A) Retornar para a Branch de Backup:
`ash
git checkout backup-v2.5.0
`

#### B) Restaurar o estado exato da Tag v2.5.0-stable:
`ash
git checkout v2.5.0-stable
`

#### C) Forçar a branch atual a voltar para o commit da v2.5.0:
`ash
git reset --hard v2.5.0-stable
`

---

### Método 4: Cópia Manual do Snapshot
Se preferir copiar manualmente via Windows Explorer:
1. Abra a pasta ecovery\snapshot_v2.5.0\.
2. Selecione todos os arquivos e pastas internos.
3. Copie (Ctrl + C) e cole (Ctrl + V) na raiz do projeto, substituindo os arquivos existentes.
4. Execute 
pm test para certificar-se de que tudo está verde.

---

## 📦 Conteúdo Protegido no Snapshot

O snapshot em ecovery/snapshot_v2.5.0/ contém:
- Shell da aplicação (index.html, manifest.json, sw.js).
- Estilos e Design System (css/styles.css).
- Código-fonte modular (js/store.js, js/app.js, js/charts.js, js/icons.js).
- Bundle standalone zero-CORS (js/bundle.js).
- Ativos de imagem e ícones PWA (ssets/).
- Scripts de compilação (scripts/build_bundle.js).
- Suíte completa com os 59 testes automatizados (	ests/).
- Documentação e memórias (README.md, RELEASE_NOTES.md, MEMORY.md, LICENSE, package.json, .gitignore).

---

*Finanças Pediatria — Desenvolvido com segurança e carinho por FChNeto.* 🩺🌸
