/**
 * scripts/ci_security_scan.js
 * Automated CI Security, CSP, and Metadata Integrity Scanner
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function main() {
  console.log('--- Starting CI Security & CSP Scan ---');

  // 1. Check canonical author in key files
  const authorFiles = [
    'v8/js/app.js',
    'v8/js/store.js',
    'v8/js/ui.js',
    'v8/index.html',
    'v2.0/js/app.js'
  ];

  for (const relPath of authorFiles) {
    const fullPath = path.join(rootDir, relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (!content.includes('FChNeto')) {
        console.error(`FAIL: Canonical author FChNeto missing from ${relPath}`);
        process.exit(1);
      }
    }
  }

  // 2. v8 (publicada no GitHub Pages): CSP via <meta>, sem scripts remotos e sem caminhos fora da pasta
  const v8Html = path.join(rootDir, 'v8', 'index.html');
  if (!fs.existsSync(v8Html)) {
    console.error('FAIL: v8/index.html does not exist');
    process.exit(1);
  }
  const html = fs.readFileSync(v8Html, 'utf-8');
  const v8Csp = (html.match(/http-equiv="Content-Security-Policy"[^>]*content="([^"]+)"/i) || [])[1] || '';
  if (!/script-src 'self'(;|$)/.test(v8Csp) || /script-src[^;]*unsafe-inline/.test(v8Csp)) {
    console.error("FAIL: v8 CSP must use script-src 'self' without unsafe-inline");
    process.exit(1);
  }
  for (const needle of ["object-src 'none'", "base-uri 'self'"]) {
    if (!v8Csp.includes(needle)) {
      console.error(`FAIL: v8 CSP missing ${needle}`);
      process.exit(1);
    }
  }
  if (/href="\.\.\/|src="\.\.\//.test(html)) {
    console.error('FAIL: v8/index.html references files outside v8/');
    process.exit(1);
  }

  console.log('SUCCESS: All CI security, CSP, and author checks passed cleanly.');
}

main();
