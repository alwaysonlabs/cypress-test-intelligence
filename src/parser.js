'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * Parse a Cypress test file and return its structure.
 *
 * @param {string} filePath  Absolute path to the file
 * @param {string} rootDir   Root tests directory (for relative paths)
 * @returns {object}  Parsed file descriptor
 */
function parseFile(filePath, rootDir) {
  let content;
  let stats;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
    stats   = fs.statSync(filePath);
  } catch (_) {
    return null;
  }

  /* ── Line-number index ──────────────────────────────────────────────────── */
  const lineStarts = [0];
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '\n') lineStarts.push(i + 1);
  }

  function getLine(pos) {
    let lo = 0, hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= pos) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  }

  /* ── Matching bracket finder (handles strings & comments) ──────────────── */
  function findMatching(pos, open, close) {
    let depth = 1;
    let inString = false, sc = null;
    let inLineComment = false, inBlockComment = false;

    while (pos < content.length) {
      if (inLineComment)  { if (content[pos] === '\n') inLineComment = false; pos++; continue; }
      if (inBlockComment) {
        if (content[pos] === '*' && content[pos + 1] === '/') { inBlockComment = false; pos += 2; } else pos++;
        continue;
      }
      if (inString) {
        if (content[pos] === '\\') { pos += 2; continue; }
        if (content[pos] === sc)   { inString = false; }
        pos++; continue;
      }

      const c = content[pos];
      if (c === '/' && content[pos + 1] === '/') { inLineComment  = true; pos += 2; continue; }
      if (c === '/' && content[pos + 1] === '*') { inBlockComment = true; pos += 2; continue; }
      if (c === '"' || c === "'" || c === '`')   { inString = true; sc = c; pos++; continue; }

      if (c === open)  depth++;
      else if (c === close) { depth--; if (depth === 0) return pos; }

      pos++;
    }
    return -1;
  }

  /* ── Extract tags from an object literal string ─────────────────────────── */
  function extractTagsFromObj(objStr) {
    const m = objStr.match(/\btags\s*:\s*(\[[^\]]*\]|["'`][^"'`]*["'`])/);
    if (!m) return [];
    const val = m[1].trim();
    const tags = [];
    if (val.startsWith('[')) {
      const re = /["'`]([^"'`]*)["'`]/g;
      let hit;
      while ((hit = re.exec(val)) !== null) tags.push(hit[1]);
    } else {
      const hit = val.match(/["'`]([^"'`]*)["'`]/);
      if (hit) tags.push(hit[1]);
    }
    return tags;
  }

  /* ── Parse the arguments of a describe/it call ──────────────────────────── */
  function parseCall(openParen) {
    const closeParen = findMatching(openParen + 1, '(', ')');
    if (closeParen === -1) return null;

    let pos = openParen + 1;
    // Skip whitespace
    while (pos < closeParen && /\s/.test(content[pos])) pos++;

    // ── Extract test name (first string arg) ──
    let name = '';
    const q = content[pos];
    if (q === '"' || q === "'" || q === '`') {
      let i = pos + 1;
      let templateDepth = 0;
      while (i < closeParen) {
        const c = content[i];
        if (c === '\\') { i += 2; continue; }
        if (q === '`') {
          if (c === '$' && content[i + 1] === '{') { templateDepth++; i += 2; continue; }
          if (templateDepth > 0 && c === '}')       { templateDepth--; i++;   continue; }
          if (templateDepth > 0)                    { i++; continue; }
        }
        if (c === q && templateDepth === 0) break;
        name += c;
        i++;
      }
      pos = i + 1;
    }

    // Skip comma + whitespace
    while (pos < closeParen && /[\s,]/.test(content[pos])) pos++;

    // ── Check for options object (tags) ──
    let tags = [];
    if (pos < closeParen && content[pos] === '{') {
      const objClose = findMatching(pos + 1, '{', '}');
      if (objClose !== -1 && objClose < closeParen) {
        tags = extractTagsFromObj(content.slice(pos, objClose + 1));
        pos  = objClose + 1;
      }
    }

    // Skip comma + whitespace
    while (pos < closeParen && /[\s,]/.test(content[pos])) pos++;

    // ── Find function body { ──
    let bodyOpen = -1;
    let scan = pos;

    while (scan < closeParen) {
      const c = content[scan];

      // Skip strings inside the callback declaration
      if (c === '"' || c === "'" || c === '`') {
        const sq = c; scan++;
        while (scan < closeParen) {
          if (content[scan] === '\\') { scan += 2; continue; }
          if (content[scan] === sq)    break;
          scan++;
        }
        scan++; continue;
      }
      // Skip line comments
      if (c === '/' && content[scan + 1] === '/') { while (scan < closeParen && content[scan] !== '\n') scan++; continue; }
      // Skip block comments
      if (c === '/' && content[scan + 1] === '*') {
        scan += 2;
        while (scan < closeParen - 1 && !(content[scan] === '*' && content[scan + 1] === '/')) scan++;
        scan += 2; continue;
      }

      // Arrow function: => {
      if (c === '=' && content[scan + 1] === '>') {
        scan += 2;
        while (scan < closeParen && /[ \t\r\n]/.test(content[scan])) scan++;
        if (content[scan] === '{') { bodyOpen = scan; break; }
        break; // expression body — no braces
      }

      // function keyword
      if (content.slice(scan, scan + 8) === 'function') {
        scan += 8;
        while (scan < closeParen && /[\w$]/.test(content[scan])) scan++;
        while (scan < closeParen && content[scan] !== '(') scan++;
        if (content[scan] === '(') {
          const cp = findMatching(scan + 1, '(', ')');
          if (cp !== -1) scan = cp + 1;
        }
        while (scan < closeParen && /\s/.test(content[scan])) scan++;
        if (content[scan] === '{') { bodyOpen = scan; break; }
        break;
      }

      scan++;
    }

    let bodyStart = -1, bodyEnd = -1;
    if (bodyOpen !== -1) {
      bodyStart = bodyOpen + 1;
      bodyEnd   = findMatching(bodyStart, '{', '}');
    }

    return { name: name || '(unnamed)', tags, openParen, closeParen, bodyStart, bodyEnd };
  }

  /* ── Recursive section parser ───────────────────────────────────────────── */
  // Matches describe/context/suite variants
  const SUITE_RE = /\b(describe|context|suite)(\.skip|\.only)?\s*\(/g;
  // Matches it/test/specify variants
  const TEST_RE  = /\b(it|test|specify)(\.skip|\.only)?\s*\(/g;

  function parseSection(start, end) {
    const suites = [];
    const tests  = [];
    const blocks = [];

    let m;

    SUITE_RE.lastIndex = start;
    while ((m = SUITE_RE.exec(content)) !== null) {
      if (m.index >= end) break;
      blocks.push({
        type:       'suite',
        pos:        m.index,
        openParen:  m.index + m[0].length - 1,
        modifier:   m[2] ? m[2].slice(1) : null,
      });
    }

    TEST_RE.lastIndex = start;
    while ((m = TEST_RE.exec(content)) !== null) {
      if (m.index >= end) break;
      blocks.push({
        type:       'test',
        pos:        m.index,
        openParen:  m.index + m[0].length - 1,
        modifier:   m[2] ? m[2].slice(1) : null,
      });
    }

    blocks.sort((a, b) => a.pos - b.pos);

    let skipUntil = start;

    for (const block of blocks) {
      if (block.pos < skipUntil) continue;

      const parsed = parseCall(block.openParen);
      if (!parsed) continue;

      if (block.type === 'suite') {
        const suite = {
          name:         parsed.name,
          modifier:     block.modifier,
          tags:         parsed.tags,
          tests:        [],
          nestedSuites: [],
          line:         getLine(block.pos),
        };

        if (parsed.bodyStart !== -1 && parsed.bodyEnd !== -1) {
          const inner = parseSection(parsed.bodyStart, parsed.bodyEnd);
          suite.tests        = inner.tests;
          suite.nestedSuites = inner.suites;
          skipUntil          = parsed.bodyEnd + 1;
        } else {
          skipUntil = parsed.closeParen + 1;
        }

        suites.push(suite);
      } else {
        tests.push({
          name:     parsed.name,
          modifier: block.modifier,
          tags:     parsed.tags,
          line:     getLine(block.pos),
        });
        skipUntil = parsed.closeParen + 1;
      }
    }

    return { suites, tests };
  }

  /* ── Run parser ─────────────────────────────────────────────────────────── */
  const { suites, tests: orphanTests } = parseSection(0, content.length);

  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const folder  = path.dirname(relPath) === '.' ? '' : path.dirname(relPath);

  return {
    filePath,
    relativePath: relPath,
    folder,
    fileSize: stats.size,
    suites,
    orphanTests,
  };
}

module.exports = { parseFile };
