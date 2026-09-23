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
}

buildRootBundle();
buildV2Bundle();
