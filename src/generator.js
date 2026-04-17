'use strict';

const fs           = require('fs');
const path         = require('path');
const { execSync } = require('child_process');
const { scanDirectory } = require('./scanner');
const { parseFile }     = require('./parser');
const { buildReport }   = require('./template');

const PKG_VERSION = (() => {
  try { return require('../package.json').version; } catch (_) { return '?'; }
})();

// Load Buy-me-a-coffee gif as inline base64 (best-effort)
let BMC_GIF_DATA = null;
try {
  const gifPath = path.join(__dirname, '../assets/giphy.gif');
  BMC_GIF_DATA = 'data:image/gif;base64,' + fs.readFileSync(gifPath).toString('base64');
} catch (_) { /* gif missing — button simply won't render */ }

const LOGO_MIME = { svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp' };

/**
 * Resolve a custom logo option to a src-ready string (URL or data URI).
 * Returns null if the logo cannot be loaded.
 */
function resolveLogoData(logo) {
  if (!logo) return null;
  // Already a URL or data URI — use as-is
  if (/^(https?:\/\/|data:)/.test(logo)) return logo;
  // Local file — embed as base64
  try {
    const logoPath = path.resolve(process.cwd(), logo);
    const ext  = path.extname(logo).toLowerCase().slice(1);
    const mime = LOGO_MIME[ext] || 'image/png';
    return `data:${mime};base64,` + fs.readFileSync(logoPath).toString('base64');
  } catch (_) {
    return null; // file not found — fall back to default icon
  }
}

/**
 * Main entry-point: scan files → parse → build HTML → write.
 */
async function run(options) {
  const {
    testsPath,
    testsPathRaw,
    excludeFolders = [],
    outputPath,
    openReport = false,
  } = options;

  // 1. Discover test files
  if (!fs.existsSync(testsPath)) {
    throw new Error(`Tests path not found: ${testsPath}`);
  }

  console.log(`\nScanning: ${testsPath}`);
  if (excludeFolders.length) {
    console.log(`Excluding: ${excludeFolders.join(', ')}`);
  }

  const filePaths = scanDirectory(testsPath, excludeFolders);

  if (filePaths.length === 0) {
    console.warn('\nNo Cypress test files found. Check the --path option.');
    return;
  }

  console.log(`Found ${filePaths.length} test file(s)`);

  // 2. Parse each file
  const files = [];
  for (const fp of filePaths) {
    const parsed = parseFile(fp, testsPath);
    if (parsed) files.push(parsed);
  }

  // 3. Build HTML
  const html = buildReport(files, {
    ...options,
    testsPathRaw:  testsPathRaw || testsPath,
    generatedAt:   new Date().toISOString(),
    nodeVersion:   process.version,
    platform:      process.platform,
    pkgVersion:    PKG_VERSION,
    bmcGifData:    BMC_GIF_DATA,
    logoData:      resolveLogoData(options.logo),
  });

  // 4. Write output
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`\nReport saved: ${outputPath}\n`);

  // 5. Optionally open in browser
  if (openReport) {
    try {
      const platform = process.platform;
      const cmd = platform === 'darwin' ? `open "${outputPath}"`
                : platform === 'win32'  ? `start "" "${outputPath}"`
                :                         `xdg-open "${outputPath}"`;
      execSync(cmd, { stdio: 'ignore' });
    } catch (_) { /* best-effort */ }
  }
}

module.exports = { run };
