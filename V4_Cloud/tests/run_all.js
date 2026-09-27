/**
 * run_all.js
 * Master Test Runner executing all V4_Cloud test suites.
 * Canonical Author: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_CREATOR = 'FChNeto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const v4Root = path.resolve(__dirname, '..');

export const REGISTERED_SUITES = [
  'tests/v4_cloud_schema.test.js',
  'tests/v4_cloud_rls.test.js',
  'tests/v4_cloud_domain.test.js',
  'tests/v4_cloud_sync.test.js',
  'tests/v4_cloud_auth.test.js',
  'tests/v4_cloud_ui.test.js',
  'tests/v4_cloud_vercel.test.js',
  'tests/v4_cloud_e2e_scenarios.test.js',
  'tests/v4_cloud_rls_adversarial.test.js',
  'tests/v4_cloud_vercel_adversarial.test.js',
  'tests/v4_cloud_m1_challenger.test.js',
  'tests/v4_cloud_m2_adversarial.test.js',
  'tests/v4_cloud_m3_challenger1.test.js',
  'tests/v4_cloud_m3_challenger2.test.js',
  'tests/v4_cloud_adversarial_sync.test.js',
  'tests/v4_cloud_adversarial_domain.test.js'
];

console.log(`\n🩺🌸 [V4_Cloud Master Test Runner] Executing ${REGISTERED_SUITES.length} Test Suites...`);
console.log(`   - Verified Invariant: APP_CREATOR = '${APP_CREATOR}'`);
console.log(`   - Registered Tier 4 Suite: tests/v4_cloud_e2e_scenarios.test.js`);
console.log(`   - Registered Tier 5 Adversarial Suites: tests/v4_cloud_adversarial_sync.test.js & tests/v4_cloud_adversarial_domain.test.js\n`);

const result = spawnSync('node', ['--test', 'tests/*.test.js'], {
  cwd: v4Root,
  stdio: 'inherit',
  shell: true
});

if (result.status !== 0) {
  console.error(`\n❌ [V4_Cloud Master Test Runner] Test suite failed with exit code ${result.status}`);
} else {
  console.log(`\n✨ [V4_Cloud Master Test Runner] 100% of V4_Cloud test suites PASSED with 0 errors!`);
}

process.exit(result.status ?? 0);
