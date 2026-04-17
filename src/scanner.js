'use strict';

const fs   = require('fs');
const path = require('path');

const TEST_FILE_RE = /\.(cy|spec|test)\.(js|ts|jsx|tsx)$/;

/**
 * Recursively find all Cypress test files under `dir`,
 * skipping any folder paths listed in `excludeFolders`.
 *
 * @param {string}   dir            Absolute path to scan
 * @param {string[]} excludeFolders Relative folder paths to skip (relative to dir)
 * @returns {string[]} Absolute file paths
 */
function scanDirectory(dir, excludeFolders) {
  excludeFolders = (excludeFolders || []).map(f =>
    path.resolve(dir, f).replace(/\\/g, '/')
  );

  const results = [];

  function walk(current) {
    if (!fs.existsSync(current)) return;

    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch (_) {
      return;
    }

    for (const entry of entries) {
      const full = path.join(current, entry.name);
      const normalFull = full.replace(/\\/g, '/');

      // Skip excluded folders
      if (excludeFolders.some(ex => normalFull === ex || normalFull.startsWith(ex + '/'))) {
        continue;
      }

      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && TEST_FILE_RE.test(entry.name)) {
        results.push(full);
      }
    }
  }

  walk(dir);
  return results;
}

module.exports = { scanDirectory };
