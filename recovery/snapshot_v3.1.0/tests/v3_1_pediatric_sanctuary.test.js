import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PediatricStore } from '../js/store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('Pediatric Dark Sanctuary CSS Tokens and Contrast Safeguards', () => {
  const css = fs.readFileSync(path.join(rootDir, 'css', 'styles.css'), 'utf8');

  // 1. Dark Mode Background & Text Tokens (Crisp Feminine Plum / Wine Sanctuary)
  assert.ok(css.includes('--bg-main: #150D1C'), 'Dark mode must define deep plum background #150D1C');
  assert.ok(css.includes('--card-bg: #1F1228'), 'Dark mode must define elevated plum container #1F1228');
  assert.ok(css.includes('--text-main: #FFF0F5'), 'Dark mode must use crisp high-contrast text-main #FFF0F5 (Lavender Blush)');
  assert.ok(css.includes('--text-muted: #D8B4E2'), 'Dark mode must use readable soft lilac text-muted #D8B4E2');

  // 2. High Contrast Overrides for dark mode
  assert.ok(css.includes('.dark .text-on-surface'), 'Must provide high-contrast text-on-surface override');
  assert.ok(css.includes('.dark .custom-select-popover'), 'Must provide dark styling for custom-select-popover');
  assert.ok(css.includes('.dark .custom-select-item'), 'Must provide dark styling for custom-select-item');

  // 3. Custom Select Styles
  assert.ok(css.includes('.custom-select-trigger'), 'Must define .custom-select-trigger');
  assert.ok(css.includes('.custom-select-popover'), 'Must define .custom-select-popover');
  assert.ok(css.includes('.custom-select-item'), 'Must define .custom-select-item');
  assert.ok(css.includes('border-radius: 16px') || css.includes('border-radius: 20px'), 'Custom select must have rounded borders');

  // 4. Drawer & Floating Particle Styles
  assert.ok(css.includes('.drawer-panel'), 'Must define .drawer-panel');
  assert.ok(css.includes('.drawer-overlay'), 'Must define .drawer-overlay');
  assert.ok(css.includes('.pediatric-particle'), 'Must define .pediatric-particle');
  assert.ok(css.includes('@keyframes floatFlutterUp'), 'Must define particle floatFlutterUp animation');
});

test('index.html layout decluttering, hamburger drawer, and doctor photo markup', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  // 1. Decluttered Top Bar
  assert.ok(html.includes('id="btn-hamburger"'), 'Header must contain btn-hamburger button');
  assert.ok(html.includes('id="btn-profile"'), 'Header must contain btn-profile avatar button');
  assert.ok(html.includes('id="header-avatar-img"'), 'Header must have img tag for doctor photo');
  assert.ok(html.includes('id="header-avatar-initials"'), 'Header must have span for initials fallback');

  // 2. Hamburger Drawer Structure
  assert.ok(html.includes('id="hamburger-drawer"'), 'Must contain #hamburger-drawer panel');
  assert.ok(html.includes('id="hamburger-drawer-overlay"'), 'Must contain #hamburger-drawer-overlay');
  assert.ok(html.includes('id="btn-close-drawer"'), 'Must contain #btn-close-drawer');
  assert.ok(html.includes('id="btn-drawer-upload-photo"'), 'Must contain #btn-drawer-upload-photo');
  assert.ok(html.includes('id="input-doctor-photo"'), 'Must contain #input-doctor-photo file input');
  assert.ok(html.includes('id="btn-drawer-legal"'), 'Must contain #btn-drawer-legal compliance button');

  // 3. Relocated Action Buttons Preserved in Drawer
  assert.ok(html.includes('id="btn-notifications"'), 'Preserves #btn-notifications');
  assert.ok(html.includes('id="btn-toggle-privacy"'), 'Preserves #btn-toggle-privacy');
  assert.ok(html.includes('id="btn-spotlight"'), 'Preserves #btn-spotlight');
  assert.ok(html.includes('id="btn-toggle-frame"'), 'Preserves #btn-toggle-frame');
  assert.ok(html.includes('id="btn-install-app"'), 'Preserves #btn-install-app');

  // 4. Management Shortcuts in Drawer
  assert.ok(html.includes('id="drawer-shortcut-dre"'), 'Must contain DRE shortcut');
  assert.ok(html.includes('id="drawer-shortcut-reconcile"'), 'Must contain Reconciliation shortcut');
  assert.ok(html.includes('id="drawer-shortcut-contador"'), 'Must contain Kit Contador shortcut');
  assert.ok(html.includes('id="drawer-shortcut-sbar"'), 'Must contain SBAR shortcut');
  assert.ok(html.includes('id="drawer-shortcut-fire"'), 'Must contain FIRE shortcut');
  assert.ok(html.includes('id="drawer-shortcut-trash"'), 'Must contain Trash shortcut');

  // 5. Particles Container
  assert.ok(html.includes('id="pediatric-particles-container"'), 'Must contain pediatric particles container');
});

test('PediatricStore supports doctorPhoto in profile update and data persistence', () => {
  const store = new PediatricStore('test_doctor_photo_store');
  const dummyPhoto = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';

  // Initially null
  assert.equal(store.data.doctorPhoto, null);

  // Update with base64 photo
  store.updateDoctorProfile({ doctorPhoto: dummyPhoto });
  assert.equal(store.data.doctorPhoto, dummyPhoto);

  // Remove photo
  store.updateDoctorProfile({ doctorPhoto: null });
  assert.equal(store.data.doctorPhoto, null);
});

test('Bundle includes new v3.1 functions for Custom Select, Drawer, Particles, and Legal Compliance', () => {
  const bundle = fs.readFileSync(path.join(rootDir, 'js', 'bundle.js'), 'utf8');

  assert.ok(bundle.includes('renderCustomSelectHTML'), 'Bundle must export renderCustomSelectHTML');
  assert.ok(bundle.includes('attachCustomSelectEvents'), 'Bundle must export attachCustomSelectEvents');
  assert.ok(bundle.includes('openHamburgerDrawer'), 'Bundle must export openHamburgerDrawer');
  assert.ok(bundle.includes('closeHamburgerDrawer'), 'Bundle must export closeHamburgerDrawer');
  assert.ok(bundle.includes('openLegalComplianceModal'), 'Bundle must export openLegalComplianceModal');
  assert.ok(bundle.includes('spawnPediatricParticles'), 'Bundle must export spawnPediatricParticles');
  assert.ok(bundle.includes('getDoctorPhoto'), 'Bundle must export getDoctorPhoto');
  assert.ok(bundle.includes('setDoctorPhoto'), 'Bundle must export setDoctorPhoto');
  assert.ok(bundle.includes('updateAllDoctorAvatars'), 'Bundle must export updateAllDoctorAvatars');

  // Verify Brazilian Legal Compliance coverage in bundle
  assert.ok(bundle.includes('Lei 13.709/2018') || bundle.includes('13.709'), 'Bundle must reference LGPD');
  assert.ok(bundle.includes('2.217/2018') || bundle.includes('2.217'), 'Bundle must reference CFM Res 2.217');
  assert.ok(bundle.includes('2.147/2016') || bundle.includes('2.147'), 'Bundle must reference CFM Res 2.147');
  assert.ok(bundle.includes('Fator R'), 'Bundle must reference Fator R');
});
