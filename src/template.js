'use strict';

const { getStyles }  = require('./styles');
const { getScripts } = require('./scripts');

/* ─── tiny HTML escape ───────────────────────────────────────────────────── */
function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ─── SVG icons (server-side rendered) ──────────────────────────────────── */
function icon(name, size) {
  size = size || 14;
  const paths = {
    check:         '<polyline points="20 6 9 17 4 12"/>',
    minus:         '<line x1="5" y1="12" x2="19" y2="12"/>',
    target:        '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    tag:           '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    layers:        '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    file:          '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>',
    'check-circle':'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    alert:         '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    'copy':        '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    search:        '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    sun:           '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    moon:          '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    'chevron-down':'<polyline points="6 9 12 15 18 9"/>',
    maximize:      '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>',
    minimize:      '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>',
  };
  const inner = paths[name] || '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

/* ─── Data processing ────────────────────────────────────────────────────── */
function processData(files) {
  let totalSuites   = 0;
  let totalTests    = 0;
  let skippedSuites = 0;
  let onlySuites    = 0;
  let skippedTests  = 0;
  let onlyTests     = 0;
  let untaggedSuites = 0;
  let untaggedTests  = 0;

  const tagCounts   = {}; // tag -> {suites, tests}
  const suiteNames  = {}; // name -> [{file, line}]
  const testNames   = {}; // name -> [{file, line}]
  const emptySuites = []; // {name, file, line}
  const allFolders  = new Set();

  function walkSuite(suite, filePath, parentTags) {
    totalSuites++;
    if (suite.modifier === 'skip') skippedSuites++;
    if (suite.modifier === 'only') onlySuites++;

    const allTags = [...parentTags, ...suite.tags];
    if (allTags.length === 0) untaggedSuites++;

    // Tag counts at suite level
    allTags.forEach(tag => {
      if (!tagCounts[tag]) tagCounts[tag] = { suites: 0, tests: 0 };
      tagCounts[tag].suites++;
    });

    // Duplicate suite names
    if (!suiteNames[suite.name]) suiteNames[suite.name] = [];
    suiteNames[suite.name].push({ file: filePath, line: suite.line });

    // Count tests
    suite.tests.forEach(t => {
      totalTests++;
      if (t.modifier === 'skip') skippedTests++;
      if (t.modifier === 'only') onlyTests++;

      const testTags = [...allTags, ...t.tags];
      if (testTags.length === 0) untaggedTests++;
      testTags.forEach(tag => {
        if (!tagCounts[tag]) tagCounts[tag] = { suites: 0, tests: 0 };
        tagCounts[tag].tests++;
      });

      // Duplicate test names
      if (!testNames[t.name]) testNames[t.name] = [];
      testNames[t.name].push({ file: filePath, suite: suite.name, line: t.line });
    });

    // Nested suites
    suite.nestedSuites.forEach(ns => walkSuite(ns, filePath, allTags));

    // Empty suite?
    const hasContent = suite.tests.length > 0 || suite.nestedSuites.length > 0;
    if (!hasContent) {
      emptySuites.push({ name: suite.name, file: filePath, line: suite.line });
    }
  }

  files.forEach(file => {
    if (file.folder) allFolders.add(file.folder);
    else if (file.relativePath.includes('/')) allFolders.add(file.relativePath.split('/')[0]);

    file.suites.forEach(s => walkSuite(s, file.relativePath, []));

    file.orphanTests.forEach(t => {
      totalTests++;
      if (t.modifier === 'skip') skippedTests++;
      if (t.modifier === 'only') onlyTests++;

      t.tags.forEach(tag => {
        if (!tagCounts[tag]) tagCounts[tag] = { suites: 0, tests: 0 };
        tagCounts[tag].tests++;
      });

      if (!testNames[t.name]) testNames[t.name] = [];
      testNames[t.name].push({ file: file.relativePath, suite: null, line: t.line });
    });
  });

  // Compute health score
  const problematic  = skippedTests + onlyTests;
  const healthScore  = totalTests > 0 ? Math.round(((totalTests - problematic) / totalTests) * 100) : 100;
  const riskLevel    = healthScore >= 90 ? 'low' : healthScore >= 70 ? 'medium' : 'high';

  // Duplicates
  const dupSuites = Object.entries(suiteNames)
    .filter(([, occ]) => occ.length > 1)
    .map(([name, occurrences]) => ({ name, occurrences }));

  const dupTests = Object.entries(testNames)
    .filter(([, occ]) => occ.length > 1)
    .map(([name, occurrences]) => ({ name, occurrences }));

  // Sort tags by total usage
  const allTags = Object.keys(tagCounts).sort((a, b) => {
    const ta = tagCounts[a].suites + tagCounts[a].tests;
    const tb = tagCounts[b].suites + tagCounts[b].tests;
    return tb - ta;
  });

  return {
    stats: {
      totalFiles: files.length,
      totalSuites,
      totalTests,
      skippedSuites,
      onlySuites,
      skippedTests,
      onlyTests,
      healthScore,
      riskLevel,
      allTags,
      allFolders: [...allFolders].sort(),
      untaggedSuites,
      untaggedTests,
    },
    issues: {
      emptySuites,
      dupSuites,
      dupTests,
    },
    tagCounts,
  };
}

/* ─── Donut SVG ──────────────────────────────────────────────────────────── */
function donutSvg(pct, color, id) {
  const da = `${pct.toFixed(1)} ${(100 - pct).toFixed(1)}`;
  return `
<div class="donut-wrap" id="${id || ''}">
  <svg class="donut-svg" viewBox="0 0 36 36">
    <circle class="donut-track" cx="18" cy="18" r="15.9155"/>
    <circle class="donut-ring" cx="18" cy="18" r="15.9155"
      stroke="${color}" stroke-dasharray="${da}" stroke-dashoffset="25"/>
  </svg>
  <div class="donut-pct">
    <span class="pct-num" style="color:${color}">${Math.round(pct)}%</span>
    <span class="pct-sym">%</span>
  </div>
</div>`;
}

/* ─── Stat card ──────────────────────────────────────────────────────────── */
function statCard(value, label, sub, color) {
  return `<div class="stat-card" style="--stat-color:${color}">
  <div class="stat-value">${esc(String(value))}</div>
  <div class="stat-label">${esc(label)}</div>
  ${sub ? `<div class="stat-sub">${esc(sub)}</div>` : ''}
</div>`;
}

const DEFAULT_OVERVIEW_TEXT = 'Static analysis report of your Cypress test suite \u2014 no test run required.';

/* ─── Summary section ────────────────────────────────────────────────────── */
function buildSummary(stats, options) {
  const riskColor = stats.riskLevel === 'low' ? 'var(--success)'
                  : stats.riskLevel === 'medium' ? 'var(--warning)'
                  : 'var(--danger)';
  const donut = donutSvg(stats.healthScore, riskColor, 'health-donut');

  const overviewText = (options.overviewText !== undefined && options.overviewText !== null)
    ? options.overviewText
    : DEFAULT_OVERVIEW_TEXT;

  return `<section class="section">
<div class="card summary-card">
  <div class="summary-top">
    <div class="summary-heading">
      <h2>Test Overview</h2>
      ${overviewText ? `<p>${esc(overviewText)}</p>` : ''}
    </div>
    <div class="risk-widget">
      <div class="risk-label-top">Health Score</div>
      ${donut}
      <div class="risk-label-bottom risk-${stats.riskLevel}">${stats.riskLevel.toUpperCase()}</div>
    </div>
  </div>
  <div class="stats-grid">
    ${statCard(stats.totalFiles,    'Test Files',      null,                      'var(--accent)')}
    ${statCard(stats.totalSuites,   'Test Suites',     'describe blocks',         'var(--accent)')}
    ${statCard(stats.totalTests,    'Total Tests',     'it / test blocks',        'var(--success)')}
    ${statCard(stats.skippedSuites, 'Skipped Suites',  'describe.skip',           stats.skippedSuites > 0 ? 'var(--warning)' : 'var(--text-3)')}
    ${statCard(stats.onlySuites,    'Only Suites',     'describe.only',           stats.onlySuites > 0 ? 'var(--info)' : 'var(--text-3)')}
    ${statCard(stats.skippedTests,  'Skipped Tests',   'it.skip',                 stats.skippedTests > 0 ? 'var(--warning)' : 'var(--text-3)')}
    ${statCard(stats.onlyTests,     'Only Tests',      'it.only',                 stats.onlyTests > 0 ? 'var(--info)' : 'var(--text-3)')}
  </div>
</div>
</section>`;
}

/* ─── Tags section ───────────────────────────────────────────────────────── */
function buildTagsSection(stats, tagCounts, options) {
  if (options.showTags === false) return '';
  if (stats.allTags.length === 0) {
    return `<section class="section">
<div class="card tags-card">
  <div class="section-heading">${icon('tag')} <h2>Tag Analysis</h2></div>
  <div class="tag-empty-state">
    ${icon('tag', 32)}<br>No tags found in test files.<br>
    <small style="color:var(--text-4)">Use <code>{ tags: ['@smoke'] }</code> in your describe() or it() calls.</small>
  </div>
</div>
</section>`;
  }

  // Build tag options — UNTAGGED sentinel first, then regular tags
  const untaggedOption = `<label class="ms-option ms-option-untagged">
  <input type="checkbox" value="__UNTAGGED__" onchange="toggleTagAnalysisUntagged(this)">
  <span class="ms-option-label">UNTAGGED</span>
  <span class="ms-option-count">${stats.untaggedSuites}s / ${stats.untaggedTests}t</span>
</label>
<div class="ms-divider"></div>`;

  let tagOptions = untaggedOption;
  stats.allTags.forEach(tag => {
    const counts = tagCounts[tag] || { suites: 0, tests: 0 };
    tagOptions += `<label class="ms-option">
  <input type="checkbox" value="${esc(tag)}" onchange="toggleTagSelection('${esc(tag)}', this)">
  <span class="ms-option-label">${esc(tag)}</span>
  <span class="ms-option-count">${counts.suites}s / ${counts.tests}t</span>
</label>`;
  });

  // Tag pills overview (clickable shortcuts)
  let tagPills = '';
  stats.allTags.forEach(tag => {
    const safeTag = esc(tag).replace(/'/g, '&#39;');
    tagPills += `<span class="tag-pill" data-tag="${esc(tag)}" onclick="clickTagPill('${safeTag}')">${esc(tag)}</span>`;
  });

  return `<section class="section">
<div class="card tags-card">
  <div class="section-heading">
    ${icon('tag')}
    <h2>Tag Analysis</h2>
    <span class="section-badge">${stats.allTags.length} tag${stats.allTags.length !== 1 ? 's' : ''}</span>
  </div>

  <div class="tag-controls">
    <!-- Multi-select tag picker -->
    <div class="multi-select" id="tag-select">
      <button class="multi-select-btn" id="tag-select-btn"
              onclick="toggleTagDropdown('tag-select')" type="button">
        <span class="multi-select-btn-label" id="tag-select-label">Select tags&hellip;</span>
        ${icon('chevron-down', 14)}
      </button>
      <div class="multi-select-dropdown" id="tag-select-dd">
        <div class="ms-search">
          <input type="text" placeholder="Search tags&hellip;" oninput="filterTagOptions(this)">
        </div>
        <div class="ms-options">${tagOptions}</div>
        <div class="ms-footer">
          <button type="button" onclick="clearAllTags()">Clear all</button>
          <button type="button" onclick="selectAllTags()">Select all</button>
        </div>
      </div>
    </div>

    <!-- All tag pills overview -->
    <div class="tag-pills">${tagPills}</div>
  </div>

  <!-- Donut charts (hidden until tags selected) -->
  <div id="tag-charts" class="tag-charts-grid" style="display:none">
    <div class="tag-chart-card">
      <div class="tag-chart-donut">
        <div class="donut-wrap" id="suites-donut">
          <svg class="donut-svg" viewBox="0 0 36 36">
            <circle class="donut-track" cx="18" cy="18" r="15.9155"/>
            <circle class="donut-ring" cx="18" cy="18" r="15.9155"
              stroke="var(--accent)" stroke-dasharray="0 100" stroke-dashoffset="25"/>
          </svg>
          <div class="donut-pct">
            <span class="pct-num" style="color:var(--accent)">0%</span>
          </div>
        </div>
      </div>
      <div class="tag-chart-info">
        <h3>Test Suites</h3>
        <div class="tag-chart-stat" id="tag-suites-count">0</div>
        <div class="tag-chart-sub" id="tag-suites-sub">of 0 suites</div>
      </div>
    </div>

    <div class="tag-chart-card">
      <div class="tag-chart-donut">
        <div class="donut-wrap" id="tests-donut">
          <svg class="donut-svg" viewBox="0 0 36 36">
            <circle class="donut-track" cx="18" cy="18" r="15.9155"/>
            <circle class="donut-ring" cx="18" cy="18" r="15.9155"
              stroke="var(--accent)" stroke-dasharray="0 100" stroke-dashoffset="25"/>
          </svg>
          <div class="donut-pct">
            <span class="pct-num" style="color:var(--accent)">0%</span>
          </div>
        </div>
      </div>
      <div class="tag-chart-info">
        <h3>Tests</h3>
        <div class="tag-chart-stat" id="tag-tests-count">0</div>
        <div class="tag-chart-sub" id="tag-tests-sub">of 0 tests</div>
      </div>
    </div>
  </div>

  <!-- Empty charts placeholder -->
  <div id="tag-charts-empty" class="tag-empty-state">
    ${icon('tag', 28)}<br>Select one or more tags above to see distribution charts.
  </div>
</div>
</section>`;
}

/* ─── Issues section ─────────────────────────────────────────────────────── */
function buildIssuesSection(issues) {
  const hasIssues = issues.emptySuites.length > 0
                 || issues.dupSuites.length > 0
                 || issues.dupTests.length > 0;

  if (!hasIssues) {
    return `<section class="section">
<div class="card issues-card">
  <div class="section-heading">${icon('check-circle')} <h2>Issues</h2></div>
  <div class="issues-none">${icon('check-circle', 28)}<br>No issues found &mdash; no empty suites or duplicate names detected.</div>
</div>
</section>`;
  }

  function renderOccurrences(occurrences, showSuite) {
    return occurrences.map(o => {
      const suitePart = showSuite && o.suite ? `<span> &rsaquo; ${esc(o.suite)}</span>` : '';
      return `<div class="issue-item-file"><span>${esc(o.file)}</span>${suitePart} &mdash; line ${o.line}</div>`;
    }).join('');
  }

  let groups = '';

  if (issues.emptySuites.length > 0) {
    const items = issues.emptySuites.map(s =>
      `<div class="issue-item">
        <div class="issue-item-name">${esc(s.name)}</div>
        <div class="issue-item-files"><div class="issue-item-file"><span>${esc(s.file)}</span> &mdash; line ${s.line}</div></div>
      </div>`
    ).join('');
    groups += `<div class="issue-group">
      <div class="issue-group-title">
        ${icon('alert', 12)}
        Empty Suites
        <span class="issue-count-badge badge-warning">${issues.emptySuites.length}</span>
      </div>
      <div class="issue-list">${items}</div>
    </div>`;
  }

  if (issues.dupSuites.length > 0) {
    const items = issues.dupSuites.map(d =>
      `<div class="issue-item">
        <div class="issue-item-name">${esc(d.name)}</div>
        <div class="issue-item-files">${renderOccurrences(d.occurrences, false)}</div>
      </div>`
    ).join('');
    groups += `<div class="issue-group">
      <div class="issue-group-title">
        ${icon('layers', 12)}
        Duplicate Suite Names
        <span class="issue-count-badge badge-info">${issues.dupSuites.length}</span>
      </div>
      <div class="issue-list">${items}</div>
    </div>`;
  }

  if (issues.dupTests.length > 0) {
    const items = issues.dupTests.map(d =>
      `<div class="issue-item">
        <div class="issue-item-name">${esc(d.name)}</div>
        <div class="issue-item-files">${renderOccurrences(d.occurrences, true)}</div>
      </div>`
    ).join('');
    groups += `<div class="issue-group">
      <div class="issue-group-title">
        ${icon('check', 12)}
        Duplicate Test Names
        <span class="issue-count-badge badge-danger">${issues.dupTests.length}</span>
      </div>
      <div class="issue-list">${items}</div>
    </div>`;
  }

  const totalIssues = issues.emptySuites.length + issues.dupSuites.length + issues.dupTests.length;

  return `<section class="section">
<div class="card issues-card">
  <div class="section-heading">
    ${icon('alert')}
    <h2>Issues</h2>
    <span class="section-badge" style="background:var(--warning-glow);color:var(--warning);border-color:var(--warning-border)">${totalIssues} issue${totalIssues !== 1 ? 's' : ''}</span>
  </div>
  <div class="issues-grid">${groups}</div>
</div>
</section>`;
}

/* ─── Explorer section ───────────────────────────────────────────────────── */
function buildExplorer(stats, tagCounts, options) {
  // Folder options
  let folderOptions = `<option value="">All folders</option>`;
  stats.allFolders.forEach(f => {
    folderOptions += `<option value="${esc(f)}">${esc(f)}</option>`;
  });

  // Explorer tag dropdown options
  const explorerUntaggedOption = `<label class="ms-option ms-option-untagged">
  <input type="checkbox" value="__UNTAGGED__" onchange="toggleExplorerUntagged(this)">
  <span class="ms-option-label">UNTAGGED</span>
  <span class="ms-option-count">${stats.untaggedSuites}s / ${stats.untaggedTests}t</span>
</label>
<div class="ms-divider"></div>`;

  let explorerTagOptions = explorerUntaggedOption;
  stats.allTags.forEach(tag => {
    const counts = (tagCounts && tagCounts[tag]) || { suites: 0, tests: 0 };
    explorerTagOptions += `<label class="ms-option">
  <input type="checkbox" value="${esc(tag)}" onchange="toggleExplorerTagSelection('${esc(tag)}', this)">
  <span class="ms-option-label">${esc(tag)}</span>
  <span class="ms-option-count">${counts.suites}s / ${counts.tests}t</span>
</label>`;
  });

  return `<section class="section">
<div class="card explorer-card">
  <div class="section-heading">
    ${icon('file')}
    <h2>Test Explorer</h2>
    <span class="section-badge" id="explorer-count">${stats.totalFiles} files</span>
  </div>

  <div class="explorer-controls">
    <!-- Sort -->
    <div class="control-group">
      <span class="control-label">Sort</span>
      <select class="ctrl-select" onchange="setSort(this.value)">
        <option value="alpha"  ${stats._initSort === 'alpha'  ? 'selected' : ''}>Alphabetical</option>
        <option value="tests"  ${stats._initSort === 'tests'  ? 'selected' : ''}>Most Tests</option>
        <option value="size"   ${stats._initSort === 'size'   ? 'selected' : ''}>File Size</option>
      </select>
    </div>

    <!-- Folder filter -->
    ${stats.allFolders.length > 0 ? `
    <div class="control-group">
      <span class="control-label">Folder</span>
      <select class="ctrl-select" onchange="setFolder(this.value)">
        ${folderOptions}
      </select>
    </div>` : ''}

    <!-- Tag filter -->
    ${options.showTags !== false && stats.allTags.length > 0 ? `
    <div class="control-group">
      <span class="control-label">Tags</span>
      <div class="multi-select explorer-tag-select" id="explorer-tag-select">
        <button class="multi-select-btn" id="explorer-tag-select-btn"
                onclick="toggleTagDropdown('explorer-tag-select')" type="button">
          <span class="multi-select-btn-label" id="explorer-tag-select-label">All tags</span>
          ${icon('chevron-down', 14)}
        </button>
        <div class="multi-select-dropdown" id="explorer-tag-select-dd">
          <div class="ms-search">
            <input type="text" placeholder="Search tags&hellip;" oninput="filterTagOptions(this)">
          </div>
          <div class="ms-options">${explorerTagOptions}</div>
          <div class="ms-footer">
            <button type="button" onclick="clearAllExplorerTags()">Clear all</button>
          </div>
        </div>
      </div>
    </div>` : ''}

    <!-- Modifier filter tabs -->
    <div class="control-group">
      <span class="control-label">Filter</span>
      <div class="filter-tabs">
        <button class="filter-tab active" data-filter="all"   onclick="setFilter('all')">All</button>
        <button class="filter-tab ft-skip" data-filter="skip" onclick="setFilter('skip')">${icon('minus', 11)} Skipped</button>
        <button class="filter-tab ft-only" data-filter="only" onclick="setFilter('only')">${icon('target', 11)} Only</button>
        ${options.showTags !== false ? `<button class="filter-tab ft-notag" data-filter="notag" onclick="setFilter('notag')">${icon('tag', 11)} Untagged</button>` : ''}
      </div>
    </div>

    <div class="explorer-actions">
      <button class="btn-ghost" onclick="expandAll()">${icon('maximize', 12)} Expand all</button>
      <button class="btn-ghost" onclick="collapseAll()">${icon('minimize', 12)} Collapse all</button>
      <button class="btn-ghost" onclick="copySummary()">${icon('copy', 12)} Copy summary</button>
    </div>
  </div>

  <!-- Search bar above file list -->
  <div class="explorer-search-row">
    <div class="search-wrap search-wrap-explorer">
      ${icon('search', 14)}
      <input class="search-input" type="text"
             placeholder="Search tests, suites, tags, files&hellip;"
             oninput="handleSearch(this.value)">
    </div>
  </div>

  <div id="test-explorer">
    <!-- Rendered by scripts.js -->
  </div>
</div>
</section>`;
}

/* ─── Header ─────────────────────────────────────────────────────────────── */
function buildHeader(options, isDark) {
  const now     = new Date();
  const dateStr = now.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const title = options.pageTitle || 'Cypress Test Intelligence';

  const logoHtml = options.logoData
    ? `<img src="${options.logoData}" alt="Logo" class="logo-img" />`
    : `<div class="logo-placeholder">${icon('layers', 20)}</div>`;

  const showBmc = options.showSupportButton !== false;
  const bmcBtn = showBmc && options.bmcGifData
    ? `<a class="bmc-btn" href="https://buymeacoffee.com/alwaysonlabs" target="_blank" rel="noopener noreferrer" title="Buy me a coffee">
        <img src="${options.bmcGifData}" alt="Buy me a coffee" class="bmc-gif" />
      </a>`
    : '';

  return `<header class="header">
  <div class="header-left">
    ${logoHtml}
    <div class="header-title">
      <h1>${esc(title)}</h1>
      <div class="subtitle">${esc(dateStr)}</div>
    </div>
  </div>

  <div class="header-spacer"></div>

  <div class="header-right">
    ${bmcBtn}
    <button class="icon-btn" id="themeBtn"
            onclick="toggleTheme()"
            title="${isDark ? 'Switch to light theme' : 'Switch to dark theme'}">
      ${isDark ? icon('sun') : icon('moon')}
    </button>
  </div>
</header>`;
}

/* ─── Environment section ────────────────────────────────────────────────── */
function buildEnvironment(options) {
  const testsPathRaw = options.testsPathRaw || 'cypress/e2e';
  const items = [
    { key: 'Test Path',                 val: testsPathRaw, truncate: true },
    { key: 'Node.js',                   val: options.nodeVersion || '?' },
    { key: 'Platform',                  val: options.platform    || '?' },
    { key: 'cypress-test-intelligence', val: 'v' + (options.pkgVersion || '?') },
    { key: 'Generated',                 val: options.generatedAt
                                              ? new Date(options.generatedAt).toLocaleString('en-US', {
                                                  year: 'numeric', month: 'short', day: 'numeric',
                                                  hour: '2-digit', minute: '2-digit',
                                                })
                                              : '?' },
  ];
  return `<section class="section">
<div class="card env-card">
  <div class="env-title">Environment</div>
  <div class="env-grid">
    ${items.map(i => `<div class="env-item">
      <div class="env-key">${esc(i.key)}</div>
      <div class="env-val${i.truncate ? ' env-val-path' : ''}"${i.truncate ? ` title="${esc(i.val)}"` : ''}>${esc(i.val)}</div>
    </div>`).join('')}
  </div>
</div>
</section>`;
}

/* ─── Main build function ────────────────────────────────────────────────── */
function buildReport(files, options) {
  const theme  = options.theme || 'dark';
  const isDark = theme === 'dark';
  const sort   = options.sort || 'alpha';

  const { stats, issues, tagCounts } = processData(files);
  stats._initSort = sort;

  // Full data payload for client-side JS
  const reportData = {
    files,
    stats,
    issues,
    generatedAt:  options.generatedAt || new Date().toISOString(),
    testsPathRaw: options.testsPathRaw || 'cypress/e2e',
  };

  const bodyClass = isDark ? 'dark-theme' : 'light-theme';
  const pageTitle = options.pageTitle || 'Cypress Test Intelligence';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(pageTitle)}</title>
  <style>${getStyles()}</style>
</head>
<body class="${bodyClass}">
<div class="app">
  ${buildHeader(options, isDark)}

  <div class="main">
    <div class="container">
      ${buildSummary(stats, options)}
      ${buildTagsSection(stats, tagCounts, options)}
      ${buildIssuesSection(issues)}
      ${buildExplorer(stats, tagCounts, options)}
      ${options.showEnvironment !== false ? buildEnvironment(options) : ''}
    </div>
  </div>
  <footer class="report-footer">
    <span>Copyright &copy; 2026 Always On Labs, Inc.</span>
  </footer>
</div>

<div id="toast"></div>

<script>
var REPORT_DATA  = ${JSON.stringify(reportData)};
var INITIAL_SORT = ${JSON.stringify(sort)};
${getScripts()}
</script>
</body>
</html>`;
}

module.exports = { buildReport };
