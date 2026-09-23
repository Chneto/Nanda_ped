/**
 * Finanças Pediatria - Script Automatizado de Restauração (Recovery v3.0.0)
 * Restaura com segurança todos os arquivos para a versão estável de lançamento v3.0.0
 * Criado por: FChNeto
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const snapshotDir = path.join(rootDir, 'recovery', 'snapshot_v3.0.0');

console.log('🔄 Iniciando restauração para a versão estável v3.0.0 (Finanças Pediatria)...');

if (!fs.existsSync(snapshotDir)) {
  console.error('❌ Erro: Diretório de snapshot não encontrado em: ' + snapshotDir);
  process.exit(1);
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  const items = fs.readdirSync(snapshotDir);
  items.forEach(item => {
    const srcPath = path.join(snapshotDir, item);
    const destPath = path.join(rootDir, item);
    console.log('  -> Restaurando: ' + item);
    copyRecursiveSync(srcPath, destPath);
  });

  console.log('\n📦 Recompilando bundle unificado...');
  execSync('node scripts/build_bundle.js', { cwd: rootDir, stdio: 'inherit' });

  console.log('\n🧪 Executando suíte completa de 71 testes automatizados...');
  execSync('node --test tests/*.test.js', { cwd: rootDir, stdio: 'inherit' });

  console.log('\n✅ SUCESSO! A aplicação foi 100% restaurada para a versão v3.0.0 estável!');
} catch (error) {
  console.error('\n❌ Erro durante o processo de restauração:', error.message);
  process.exit(1);
}
