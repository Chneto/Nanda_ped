import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

let content = fs.readFileSync(path.join(rootDir, 'recovery/snapshot_v3.1.1/js/icons.js'), 'utf8');

if (!content.includes('export function getIconSvg')) {
  content += `\nexport function getIconSvg(name, customClass = '', customStyle = '') {\n  return getSvgIcon(name, customClass, customStyle);\n}\n`;
}

fs.writeFileSync(path.join(rootDir, 'js/icons.js'), content, 'utf8');
console.log('js/icons.js generated');
