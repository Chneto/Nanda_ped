import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function cleanModule(code) {
  return code
    // Strip ES module imports
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"];?/g, '')
    .replace(/import\s+[^;]+from\s*['"][^'"]+['"];?/g, '')
    // Strip ES module exports
    .replace(/^export\s+(async\s+function|const|let|var|function|class)\s+/gm, '$1 ')
    .replace(/^export\s*\{[\s\S]*?\};?/gm, '')
    .replace(/^export\s+default\s+/gm, '');
}

// 1. Constrói Bundle Raiz (v3.x Master)
function buildRootBundle() {
  const iconsPath = path.join(rootDir, 'js', 'icons.js');
  const storePath = path.join(rootDir, 'js', 'store.js');
  const chartsPath = path.join(rootDir, 'js', 'charts.js');
  const appPath = path.join(rootDir, 'js', 'app.js');
  const bundlePath = path.join(rootDir, 'js', 'bundle.js');

  let iconsCode = cleanModule(fs.readFileSync(iconsPath, 'utf8'));
  let storeCode = cleanModule(fs.readFileSync(storePath, 'utf8'));
  let chartsCode = cleanModule(chartsPath ? fs.readFileSync(chartsPath, 'utf8') : '');
  let appCode = cleanModule(fs.readFileSync(appPath, 'utf8'));

  const bundle = `/**
 * Finanças Pediatria - Unified Standalone Bundle (v3.x Master)
 * Self-contained for zero-CORS file:// protocol and offline execution
 */
(function() {
  'use strict';

  // --- ICONS SYSTEM ---
  ${iconsCode}

  // --- STORE ENGINE ---
  ${storeCode}

  // --- CHARTS ENGINE ---
  ${chartsCode}

  // --- APPLICATION LOGIC ---
  ${appCode}
})();
`;

  fs.writeFileSync(bundlePath, bundle, 'utf8');
  console.log('Root bundle escrito em:', bundlePath);
}

// 2. Constrói Bundle v2.0 (Sanctuary Minimalist)
function buildV2Bundle() {
  const v2Dir = path.join(rootDir, 'v2.0', 'js');
  const iconsPath = path.join(v2Dir, 'icons.js');
  const storePath = path.join(v2Dir, 'store.js');
  const chartsPath = path.join(v2Dir, 'charts.js');
  const appPath = path.join(v2Dir, 'app.js');
  const bundlePath = path.join(v2Dir, 'bundle.js');

  let iconsCode = cleanModule(fs.readFileSync(iconsPath, 'utf8'));
  let storeCode = cleanModule(fs.readFileSync(storePath, 'utf8'));
  let chartsCode = cleanModule(fs.readFileSync(chartsPath, 'utf8'));
  let appCode = cleanModule(fs.readFileSync(appPath, 'utf8'));

  const bundle = `/**
 * Finanças Pediatria v2.0 - Unified Standalone Bundle
 * Self-contained for zero-CORS file:// protocol and offline execution
 */
(function() {
  'use strict';

  // --- ICONS SYSTEM ---
  ${iconsCode}

  // Fallback global de ícones para o escopo do window
  if (typeof window !== 'undefined') {
    window.getIconSvg = getIconSvg;
    window.getIcon = getIcon;
  }

  // --- STORE ENGINE ---
  ${storeCode}

  // --- CHARTS ENGINE ---
  ${chartsCode}

  // --- APPLICATION LOGIC ---
  ${appCode}
})();
`;

  fs.writeFileSync(bundlePath, bundle, 'utf8');
  console.log('v2.0 bundle escrito em:', bundlePath);

  // Sincroniza alias /v2/ para o GitHub Pages
  const v2AliasDir = path.join(rootDir, 'v2', 'js');
  if (fs.existsSync(v2AliasDir)) {
    const aliasBundlePath = path.join(v2AliasDir, 'bundle.js');
    fs.writeFileSync(aliasBundlePath, bundle, 'utf8');
    console.log('v2 alias bundle escrito em:', aliasBundlePath);
  }
}

// 3. Constrói Bundle v4.0 (Silk & Rose Gold)
function buildV4Bundle() {
  const v4Dir = path.join(rootDir, 'v4', 'js');
  const iconsPath = path.join(v4Dir, 'icons.js');
  const storePath = path.join(v4Dir, 'store.js');
  const chartsPath = path.join(v4Dir, 'charts.js');
  const appPath = path.join(v4Dir, 'app.js');
  const bundlePath = path.join(v4Dir, 'bundle.js');

  let iconsCode = cleanModule(fs.readFileSync(iconsPath, 'utf8'));
  let storeCode = cleanModule(fs.readFileSync(storePath, 'utf8'));
  let chartsCode = cleanModule(fs.readFileSync(chartsPath, 'utf8'));
  let appCode = cleanModule(fs.readFileSync(appPath, 'utf8'));

  const bundle = `/**
 * Finanças Pediatria v4.0 - Silk & Rose Gold Standalone Bundle
 * Self-contained for zero-CORS file:// protocol and offline execution
 * Autor Imutável: FChNeto (APP_CREATOR = 'FChNeto')
 */
(function() {
  'use strict';

  // --- ICONS SYSTEM ---
  ${iconsCode}

  // Fallback global de ícones para o escopo do window
  if (typeof window !== 'undefined') {
    window.getIconSvg = getIconSvg;
    window.getIcon = getIcon;
  }

  // --- STORE ENGINE ---
  ${storeCode}

  // --- CHARTS ENGINE ---
  ${chartsCode}

  // --- APPLICATION LOGIC ---
  ${appCode}
})();
`;

  fs.writeFileSync(bundlePath, bundle, 'utf8');
  console.log('v4 bundle escrito em:', bundlePath);

  // Espelha para /v4.0/
  const v40Dir = path.join(rootDir, 'v4.0');
  const v4SourceDir = path.join(rootDir, 'v4');
  if (fs.existsSync(v40Dir)) {
    // Sincroniza arquivos de topo
    ['index.html', 'manifest.json', 'sw.js'].forEach(file => {
      const src = path.join(v4SourceDir, file);
      const dst = path.join(v40Dir, file);
      if (fs.existsSync(src)) fs.copyFileSync(src, dst);
    });

    // Sincroniza css/styles.css
    const cssSrc = path.join(v4SourceDir, 'css', 'styles.css');
    const cssDst = path.join(v40Dir, 'css', 'styles.css');
    if (fs.existsSync(cssSrc)) fs.copyFileSync(cssSrc, cssDst);

    // Sincroniza módulos js
    ['icons.js', 'store.js', 'charts.js', 'app.js'].forEach(file => {
      const src = path.join(v4SourceDir, 'js', file);
      const dst = path.join(v40Dir, 'js', file);
      if (fs.existsSync(src)) fs.copyFileSync(src, dst);
    });

    // Grava o bundle na pasta v4.0/js
    const v40BundlePath = path.join(v40Dir, 'js', 'bundle.js');
    fs.writeFileSync(v40BundlePath, bundle, 'utf8');
    console.log('v4.0 espelhado com sucesso em:', v40BundlePath);
  }
}

buildRootBundle();
buildV2Bundle();
buildV4Bundle();
