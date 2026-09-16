import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const iconsPath = path.join(rootDir, 'js', 'icons.js');
const storePath = path.join(rootDir, 'js', 'store.js');
const chartsPath = path.join(rootDir, 'js', 'charts.js');
const appPath = path.join(rootDir, 'js', 'app.js');
const bundlePath = path.join(rootDir, 'js', 'bundle.js');

let iconsCode = fs.readFileSync(iconsPath, 'utf8');
let storeCode = fs.readFileSync(storePath, 'utf8');
let chartsCode = fs.readFileSync(chartsPath, 'utf8');
let appCode = fs.readFileSync(appPath, 'utf8');

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

iconsCode = cleanModule(iconsCode);
storeCode = cleanModule(storeCode);
chartsCode = cleanModule(chartsCode);
appCode = cleanModule(appCode);

const bundle = `/**
 * Finanças Pediatria - Unified Standalone Bundle
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
console.log('Bundle successfully written to:', bundlePath);
console.log('Bundle file size:', bundle.length, 'bytes');
