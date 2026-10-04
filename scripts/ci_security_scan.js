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

  // 1. Check v6 vercel.json CSP
  const vercelPath = path.join(rootDir, 'v6', 'vercel.json');
  if (!fs.existsSync(vercelPath)) {
    console.error('FAIL: v6/vercel.json does not exist');
    process.exit(1);
  }

  const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
  const globalHeader = vercelConfig.headers?.find(h => h.source === '/(.*)');
  if (!globalHeader) {
    console.error('FAIL: v6/vercel.json lacks global header rule /(.*)');
    process.exit(1);
  }

  const csp = globalHeader.headers?.find(h => h.key === 'Content-Security-Policy')?.value || '';
  if (csp.includes("script-src 'unsafe-inline'")) {
    console.error("FAIL: v6 CSP contains 'unsafe-inline' in script-src");
    process.exit(1);
  }
  if (!csp.includes("object-src 'none'")) {
    console.error("FAIL: v6 CSP missing object-src 'none'");
    process.exit(1);
  }
  if (!csp.includes("base-uri 'self'")) {
    console.error("FAIL: v6 CSP missing base-uri 'self'");
    process.exit(1);
  }

  // 2. Check canonical author in key files
  const authorFiles = [
    'v6/js/config.js',
    'v6/js/store.js',
    'v6/js/ui.js',
    'v6/index.html',
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

  console.log('SUCCESS: All CI security, CSP, and author checks passed cleanly.');
}

main();
