#!/usr/bin/env node

/**
 * Build script for Chrome extension
 * Copies manifest.json and icons to dist/ directory after build
 */

import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const distDir = join(projectRoot, 'dist');
const extensionDir = join(projectRoot, 'extension');

console.log('Building Chrome extension...');

// Ensure dist directory exists
if (!existsSync(distDir)) {
  console.error('Error: dist/ directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Create icons directory in dist
const distIconsDir = join(distDir, 'icons');
if (!existsSync(distIconsDir)) {
  mkdirSync(distIconsDir, { recursive: true });
}

// Copy manifest.json
const manifestSrc = join(extensionDir, 'manifest.json');
const manifestDest = join(distDir, 'manifest.json');

try {
  copyFileSync(manifestSrc, manifestDest);
  console.log('✓ Copied manifest.json');
} catch (error) {
  console.error('Error copying manifest.json:', error.message);
  process.exit(1);
}

// Copy icons
const iconsDir = join(extensionDir, 'icons');
if (existsSync(iconsDir)) {
  const icons = readdirSync(iconsDir);

  for (const icon of icons) {
    const iconSrc = join(iconsDir, icon);
    const iconDest = join(distIconsDir, icon);

    try {
      copyFileSync(iconSrc, iconDest);
      console.log(`✓ Copied ${icon}`);
    } catch (error) {
      console.warn(`Warning: Could not copy ${icon}:`, error.message);
    }
  }
} else {
  console.warn('Warning: icons/ directory not found in extension/');
  console.warn('Please create extension icons at required sizes: 16x16, 48x48, 128x128');
}

console.log('\nChrome extension build complete!');
console.log('Load the extension from:', distDir);
console.log('\nInstructions:');
console.log('1. Open Chrome and go to chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked"');
console.log('4. Select the dist/ directory');
