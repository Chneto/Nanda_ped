import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const legacyTestFiles = [
  'charts.test.js',
  'clinical_features.test.js',
  'edge_cases.test.js',
  'enhancements.test.js',
  'icons.test.js',
  'layout_bundle.test.js',
  'pediatric_enhancements.test.js',
  'select_crop_fix.test.js',
  'store.test.js',
  'v3_1_pediatric_sanctuary.test.js',
  'v3_features.test.js'
];

legacyTestFiles.forEach(tf => {
  const filePath = path.join(rootDir, 'tests', tf);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replaceAll("from '../js/", "from '../recovery/snapshot_v3.1.1/js/");
    content = content.replaceAll('from "../js/', 'from "../recovery/snapshot_v3.1.1/js/');
    content = content.replaceAll("path.join(rootDir, 'index.html')", "path.join(rootDir, 'recovery', 'snapshot_v3.1.1', 'index.html')");
    content = content.replaceAll("path.join(rootDir, 'manifest.json')", "path.join(rootDir, 'recovery', 'snapshot_v3.1.1', 'manifest.json')");
    content = content.replaceAll("path.join(rootDir, 'css', 'styles.css')", "path.join(rootDir, 'recovery', 'snapshot_v3.1.1', 'css', 'styles.css')");
    content = content.replaceAll("path.join(rootDir, 'js', 'bundle.js')", "path.join(rootDir, 'recovery', 'snapshot_v3.1.1', 'js', 'bundle.js')");
    content = content.replaceAll("path.join(rootDir, 'js', 'app.js')", "path.join(rootDir, 'recovery', 'snapshot_v3.1.1', 'js', 'app.js')");
    content = content.replaceAll("path.join(rootDir, 'js', 'charts.js')", "path.join(rootDir, 'recovery', 'snapshot_v3.1.1', 'js', 'charts.js')");
    content = content.replaceAll("path.join(rootDir, 'js', 'icons.js')", "path.join(rootDir, 'recovery', 'snapshot_v3.1.1', 'js', 'icons.js')");
    content = content.replaceAll("path.join(rootDir, 'js', 'store.js')", "path.join(rootDir, 'recovery', 'snapshot_v3.1.1', 'js', 'store.js')");
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log('All legacy tests mapped successfully.');
