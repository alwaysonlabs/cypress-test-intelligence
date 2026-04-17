'use strict';

function getScripts() {
  // NOTE: This string is embedded verbatim in a <script> tag.
  // Do NOT use ES6 template literals here.
  return `
(function () {
  'use strict';

  /* ── State ────────────────────────────────────────────────────────────── */
  var searchQuery   = '';
  var activeFilter  = 'all';   // all | skip | only | notag
  var selectedFolder = '';
  var currentSort   = INITIAL_SORT || 'alpha';
  var expandedFiles = {};

  // Tag Analysis section state (does NOT affect Test Explorer)
  var selectedTags           = [];
  var tagAnalysisShowUntagged = false;

  // Test Explorer tag filter state (independent of Tag Analysis)
  var explorerSelectedTags = [];
  var explorerUntagged     = false;

  /* ── Bootstrap ────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    renderExplorer();
  });

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  function escH(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function svgIcon(name, size) {
    size = size || 14;
    var paths = {
      'check':        '<polyline points="20 6 9 17 4 12"/>',
      'x':            '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
      'minus':        '<line x1="5" y1="12" x2="19" y2="12"/>',
      'target':       '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
      'tag':          '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
      'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
      'maximize-2':   '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>',
      'minimize-2':   '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>',
      'search':       '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
      'sun':          '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
      'moon':         '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
      'layers':       '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
      'alert':        '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
      'copy':         '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
      'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    };
    var inner = paths[name] || '';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size
      + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"'
      + ' stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }

  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function suiteHasSkip(suite) {
    if (suite.modifier === 'skip') return true;
    for (var i = 0; i < suite.tests.length; i++) {
      if (suite.tests[i].modifier === 'skip') return true;
    }
    for (var j = 0; j < suite.nestedSuites.length; j++) {
      if (suiteHasSkip(suite.nestedSuites[j])) return true;
    }
    return false;
  }

  function suiteHasOnly(suite) {
    if (suite.modifier === 'only') return true;
    for (var i = 0; i < suite.tests.length; i++) {
      if (suite.tests[i].modifier === 'only') return true;
    }
    for (var j = 0; j < suite.nestedSuites.length; j++) {
      if (suiteHasOnly(suite.nestedSuites[j])) return true;
    }
    return false;
  }

  function fileHasSkip(file) {
    for (var i = 0; i < file.suites.length; i++) {
      if (suiteHasSkip(file.suites[i])) return true;
    }
    for (var i = 0; i < file.orphanTests.length; i++) {
      if (file.orphanTests[i].modifier === 'skip') return true;
    }
    return false;
  }

  function fileHasOnly(file) {
    for (var i = 0; i < file.suites.length; i++) {
      if (suiteHasOnly(file.suites[i])) return true;
    }
    for (var i = 0; i < file.orphanTests.length; i++) {
      if (file.orphanTests[i].modifier === 'only') return true;
    }
    return false;
  }

  // Count total tests in a file (recursively)
  function countTests(file) {
    var n = file.orphanTests.length;
    function countSuite(suite) {
      n += suite.tests.length;
      suite.nestedSuites.forEach(countSuite);
    }
    file.suites.forEach(countSuite);
    return n;
  }

  // Collect all tags in a file (suite + test level), including inherited
  function fileAllTags(file) {
    var set = {};
    function walk(suite, parentTags) {
      var allTags = parentTags.concat(suite.tags);
      allTags.forEach(function (t) { set[t] = true; });
      suite.tests.forEach(function (t) {
        t.tags.concat(allTags).forEach(function (tag) { set[tag] = true; });
      });
      suite.nestedSuites.forEach(function (ns) { walk(ns, allTags); });
    }
    file.suites.forEach(function (s) { walk(s, []); });
    file.orphanTests.forEach(function (t) { t.tags.forEach(function (tag) { set[tag] = true; }); });
    return Object.keys(set);
  }

  // Check if any test/suite in file has NO tag (including inherited)
  function fileHasUntagged(file) {
    var found = false;
    function walkSuite(suite, parentTags) {
      var allTags = parentTags.concat(suite.tags);
      if (allTags.length === 0) found = true;
      suite.tests.forEach(function (t) {
        var combined = allTags.concat(t.tags);
        if (combined.length === 0) found = true;
      });
      suite.nestedSuites.forEach(function (ns) { walkSuite(ns, allTags); });
    }
    file.suites.forEach(function (s) { walkSuite(s, []); });
    file.orphanTests.forEach(function (t) {
      if (t.tags.length === 0) found = true;
    });
    return found;
  }

  // Check if file matches the Explorer tag filter (AND logic, uses explorerSelectedTags / explorerUntagged)
  function fileMatchesTags(file) {
    if (explorerUntagged) return fileHasUntagged(file);
    if (explorerSelectedTags.length === 0) return true;

    // AND logic: file matches if it contains at least one test whose effective
    // tag set (inherited + own) includes ALL selected explorer tags.
    function testMatchesAll(combinedTags) {
      return explorerSelectedTags.every(function (st) {
        return combinedTags.indexOf(st) !== -1;
      });
    }
    function checkSuite(suite, parentTags) {
      var allTags = parentTags.concat(suite.tags);
      for (var i = 0; i < suite.tests.length; i++) {
        if (testMatchesAll(allTags.concat(suite.tests[i].tags))) return true;
      }
      for (var j = 0; j < suite.nestedSuites.length; j++) {
        if (checkSuite(suite.nestedSuites[j], allTags)) return true;
      }
      return false;
    }
    for (var i = 0; i < file.suites.length; i++) {
      if (checkSuite(file.suites[i], [])) return true;
    }
    for (var i = 0; i < file.orphanTests.length; i++) {
      if (testMatchesAll(file.orphanTests[i].tags)) return true;
    }
    return false;
  }

  // Full text search across file path, suite names, test names, tags
  function fileMatchesSearch(file) {
    if (!searchQuery) return true;
    var q = searchQuery;
    if (file.relativePath.toLowerCase().indexOf(q) !== -1) return true;
    function checkSuite(suite) {
      if (suite.name.toLowerCase().indexOf(q) !== -1) return true;
      for (var i = 0; i < suite.tags.length; i++) {
        if (suite.tags[i].toLowerCase().indexOf(q) !== -1) return true;
      }
      for (var j = 0; j < suite.tests.length; j++) {
        var t = suite.tests[j];
        if (t.name.toLowerCase().indexOf(q) !== -1) return true;
        for (var k = 0; k < t.tags.length; k++) {
          if (t.tags[k].toLowerCase().indexOf(q) !== -1) return true;
        }
      }
      for (var l = 0; l < suite.nestedSuites.length; l++) {
        if (checkSuite(suite.nestedSuites[l])) return true;
      }
      return false;
    }
    for (var i = 0; i < file.suites.length; i++) {
      if (checkSuite(file.suites[i])) return true;
    }
    for (var i = 0; i < file.orphanTests.length; i++) {
      var t = file.orphanTests[i];
      if (t.name.toLowerCase().indexOf(q) !== -1) return true;
      for (var k = 0; k < t.tags.length; k++) {
        if (t.tags[k].toLowerCase().indexOf(q) !== -1) return true;
      }
    }
    return false;
  }

  /* ── Filter ───────────────────────────────────────────────────────────── */
  function filterFiles(files) {
    return files.filter(function (file) {
      if (selectedFolder && file.folder !== selectedFolder) return false;
      if (!fileMatchesTags(file)) return false;
      if (!fileMatchesSearch(file)) return false;
      if (activeFilter === 'skip')  return fileHasSkip(file);
      if (activeFilter === 'only')  return fileHasOnly(file);
      if (activeFilter === 'notag') return fileHasUntagged(file);
      return true;
    });
  }

  /* ── Sort ─────────────────────────────────────────────────────────────── */
  function sortFiles(files) {
    var sorted = files.slice();
    if (currentSort === 'tests') {
      sorted.sort(function (a, b) { return countTests(b) - countTests(a); });
    } else if (currentSort === 'size') {
      sorted.sort(function (a, b) { return b.fileSize - a.fileSize; });
    } else {
      // alpha
      sorted.sort(function (a, b) {
        return a.relativePath.localeCompare(b.relativePath);
      });
    }
    return sorted;
  }

  /* ── Render Explorer ─────────────────────────────────────────────────── */
  window.renderExplorer = function () {
    var container = document.getElementById('test-explorer');
    if (!container) return;

    var visible = filterFiles(sortFiles(REPORT_DATA.files));
    var total   = REPORT_DATA.files.length;

    // Update counter
    var counter = document.getElementById('explorer-count');
    if (counter) counter.textContent = visible.length + ' / ' + total + ' files';

    if (visible.length === 0) {
      container.innerHTML = '<div class="no-results">' + svgIcon('search', 40)
        + '<p>No test files match the current filters.</p></div>';
      return;
    }

    var html = '';
    visible.forEach(function (file, idx) {
      var fileIdx = REPORT_DATA.files.indexOf(file);
      html += renderFileCard(file, fileIdx);
    });
    container.innerHTML = html;

    // Re-apply expanded state
    Object.keys(expandedFiles).forEach(function (k) {
      if (expandedFiles[k]) {
        var el = document.getElementById('file-' + k);
        if (el) el.classList.add('expanded');
      }
    });
  };

  function renderFileCard(file, idx) {
    var hasSkip = fileHasSkip(file);
    var hasOnly = fileHasOnly(file);
    var cls = 'file-card' + (hasSkip ? ' has-skip' : '') + (hasOnly ? ' has-only' : '');
    var isExpanded = expandedFiles[idx];

    // Path display
    var parts = file.relativePath.split('/');
    var fileName = parts[parts.length - 1];
    var dir = parts.slice(0, -1).join('/');
    var nameHtml = dir ? '<span class="file-folder">' + escH(dir) + '/</span>' + escH(fileName) : escH(fileName);

    var totalTests = countTests(file);

    var html = '<div class="' + cls + (isExpanded ? ' expanded' : '') + '" id="file-' + idx + '">';
    html += '<div class="file-header" onclick="toggleFile(' + idx + ')">';
    html += '<div class="file-status-dot"></div>';
    html += '<div class="file-name">' + nameHtml + '</div>';
    html += '<div class="file-meta">';
    html += '<div class="file-badges">';
    html += '<span class="badge badge-tests">' + svgIcon('check', 9) + totalTests + ' tests</span>';
    if (file.suites.length > 0) {
      html += '<span class="badge badge-suites">' + svgIcon('layers', 9) + file.suites.length + ' suite' + (file.suites.length !== 1 ? 's' : '') + '</span>';
    }
    if (hasSkip) html += '<span class="badge badge-skip">' + svgIcon('minus', 9) + ' skip</span>';
    if (hasOnly) html += '<span class="badge badge-only">' + svgIcon('target', 9) + ' only</span>';
    html += '<span class="badge badge-size">' + escH(fmtSize(file.fileSize)) + '</span>';
    html += '</div>';
    html += '</div>';
    html += '<button class="expand-btn" onclick="toggleFile(' + idx + '); event.stopPropagation();">'
      + svgIcon('chevron-down', 14) + '</button>';
    html += '</div>'; // .file-header

    html += '<div class="file-body">';

    // Suites
    file.suites.forEach(function (suite) {
      html += renderSuiteBlock(suite, []);
    });

    // Orphan tests
    if (file.orphanTests.length > 0) {
      html += '<div class="orphan-tests">';
      html += '<div class="orphan-label">Top-level tests</div>';
      file.orphanTests.forEach(function (t) {
        html += renderTestRow(t, []);
      });
      html += '</div>';
    }

    html += '</div>'; // .file-body
    html += '</div>'; // .file-card

    return html;
  }

  function renderSuiteBlock(suite, parentTags) {
    var allSuiteTags = parentTags.concat(suite.tags);
    var html = '<div class="suite-block">';

    html += '<div class="suite-row">';
    if (suite.modifier === 'skip') {
      html += '<span class="modifier-badge modifier-skip">skip</span>';
    } else if (suite.modifier === 'only') {
      html += '<span class="modifier-badge modifier-only">only</span>';
    }
    html += '<div class="suite-name">' + escH(suite.name) + '</div>';
    // Show "Untagged" label when this suite has no effective tags and the untagged filter is active
    if (allSuiteTags.length === 0 && (activeFilter === 'notag' || explorerUntagged)) {
      html += '<span class="modifier-badge modifier-untagged">untagged</span>';
    }
    if (suite.tags.length > 0) {
      html += '<div class="suite-tags">';
      suite.tags.forEach(function (tag) {
        html += '<span class="test-tag-pill">' + escH(tag) + '</span>';
      });
      html += '</div>';
    }
    html += '<span style="font-size:0.7rem;color:var(--text-4);">line ' + suite.line + '</span>';
    html += '</div>'; // .suite-row

    html += '<div class="tests-list">';
    suite.tests.forEach(function (t) {
      html += renderTestRow(t, allSuiteTags);
    });
    html += '</div>';

    // Nested suites
    if (suite.nestedSuites.length > 0) {
      suite.nestedSuites.forEach(function (ns) {
        html += '<div class="nested-suite">' + renderSuiteBlock(ns, allSuiteTags) + '</div>';
      });
    }

    html += '</div>'; // .suite-block
    return html;
  }

  function renderTestRow(test, inheritedTags) {
    var allTags = inheritedTags.concat(test.tags);
    var nameClass = 'test-name' + (test.modifier === 'skip' ? ' is-skip' : '') + (test.modifier === 'only' ? ' is-only' : '');
    var iconClass = 'test-icon ' + (test.modifier === 'skip' ? 'icon-skip' : test.modifier === 'only' ? 'icon-only' : 'icon-normal');
    var icon = test.modifier === 'skip' ? svgIcon('minus', 10) : test.modifier === 'only' ? svgIcon('target', 10) : svgIcon('check', 10);

    var html = '<div class="test-row">';
    html += '<div class="' + iconClass + '">' + icon + '</div>';
    html += '<div class="' + nameClass + '">' + escH(test.name) + '</div>';

    if (test.tags.length > 0) {
      html += '<div class="test-tags">';
      test.tags.forEach(function (tag) {
        html += '<span class="test-tag-pill">' + escH(tag) + '</span>';
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  /* ── Expand / Collapse ────────────────────────────────────────────────── */
  window.toggleFile = function (idx) {
    expandedFiles[idx] = !expandedFiles[idx];
    var el = document.getElementById('file-' + idx);
    if (el) el.classList.toggle('expanded', !!expandedFiles[idx]);
  };

  window.expandAll = function () {
    REPORT_DATA.files.forEach(function (_, i) { expandedFiles[i] = true; });
    document.querySelectorAll('.file-card').forEach(function (c) { c.classList.add('expanded'); });
  };

  window.collapseAll = function () {
    REPORT_DATA.files.forEach(function (_, i) { expandedFiles[i] = false; });
    document.querySelectorAll('.file-card').forEach(function (c) { c.classList.remove('expanded'); });
  };

  /* ── Search ───────────────────────────────────────────────────────────── */
  window.handleSearch = function (query) {
    searchQuery = query.toLowerCase().trim();
    renderExplorer();
  };

  /* ── Filter tab ───────────────────────────────────────────────────────── */
  window.setFilter = function (filter) {
    activeFilter = filter;
    document.querySelectorAll('.filter-tab').forEach(function (el) {
      el.classList.toggle('active', el.dataset.filter === filter);
    });
    renderExplorer();
  };

  /* ── Sort ─────────────────────────────────────────────────────────────── */
  window.setSort = function (val) {
    currentSort = val;
    renderExplorer();
  };

  /* ── Folder filter ────────────────────────────────────────────────────── */
  window.setFolder = function (val) {
    selectedFolder = val;
    renderExplorer();
  };

  /* ── Multi-select tag dropdown ────────────────────────────────────────── */
  // Track which button owns each open dropdown (for click-outside detection)
  var openDropdownBtn = null;

  function closeAllDropdowns() {
    document.querySelectorAll('.multi-select-dropdown.open').forEach(function (el) {
      el.classList.remove('open');
    });
    document.querySelectorAll('.multi-select-btn.open').forEach(function (el) {
      el.classList.remove('open');
    });
    openDropdownBtn = null;
  }

  window.toggleTagDropdown = function (id) {
    var btn = document.getElementById(id + '-btn');
    var dd  = document.getElementById(id + '-dd');
    if (!btn || !dd) return;
    var isOpen = dd.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
      // Portal pattern: move the dropdown to <body> so it escapes the
      // backdrop-filter stacking context of the parent .card element.
      // (backdrop-filter creates a containing block for position:fixed children,
      //  causing them to be positioned relative to the card rather than viewport.)
      if (dd.parentElement !== document.body) {
        document.body.appendChild(dd);
      }
      var rect          = btn.getBoundingClientRect();
      var spaceBelow    = window.innerHeight - rect.bottom - 8;
      var spaceAbove    = rect.top - 8;
      var maxH          = Math.min(400, Math.max(160, spaceBelow));
      var openUpward    = spaceBelow < 180 && spaceAbove > spaceBelow;

      dd.style.position  = 'fixed';
      dd.style.left      = rect.left + 'px';
      dd.style.width     = Math.max(btn.offsetWidth, 260) + 'px';
      dd.style.minWidth  = '260px';
      dd.style.zIndex    = '99999';
      dd.style.maxHeight = (openUpward ? Math.min(400, spaceAbove) : maxH) + 'px';

      if (openUpward) {
        dd.style.top    = 'auto';
        dd.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
      } else {
        dd.style.top    = (rect.bottom + 4) + 'px';
        dd.style.bottom = 'auto';
      }

      dd.classList.add('open');
      btn.classList.add('open');
      openDropdownBtn = btn;
    }
  };

  // Close dropdowns when clicking outside.
  // Use capture phase so the check runs before any inner onclick handlers.
  document.addEventListener('click', function (e) {
    if (!openDropdownBtn) return;
    // Allow clicks inside the open dropdown or on the trigger button itself
    var insideDropdown = e.target.closest('.multi-select-dropdown');
    var insideBtn      = e.target.closest('.multi-select-btn');
    if (!insideDropdown && !insideBtn) {
      closeAllDropdowns();
    }
  }, true);

  // Close dropdowns when the PAGE scrolls (position would be stale),
  // but NOT when the scroll originates inside an open dropdown itself.
  window.addEventListener('scroll', function (e) {
    if (e.target && typeof e.target.closest === 'function'
        && e.target.closest('.multi-select-dropdown')) {
      return; // scrolling inside the dropdown options list — keep it open
    }
    closeAllDropdowns();
  }, true);
  window.addEventListener('resize', function () { closeAllDropdowns(); });

  window.filterTagOptions = function (inputEl) {
    var q = inputEl.value.toLowerCase();
    var parent = inputEl.closest('.multi-select-dropdown');
    if (!parent) return;
    parent.querySelectorAll('.ms-option').forEach(function (opt) {
      // Always show the UNTAGGED sentinel option
      if (opt.classList.contains('ms-option-untagged')) { opt.style.display = ''; return; }
      var label = opt.querySelector('.ms-option-label');
      var text = label ? label.textContent.toLowerCase() : '';
      opt.style.display = text.indexOf(q) !== -1 ? '' : 'none';
    });
  };

  /* ── Explorer tag filter ─────────────────────────────────────────────── */
  window.toggleExplorerTagSelection = function (tag, checkboxEl) {
    var idx = explorerSelectedTags.indexOf(tag);
    if (checkboxEl.checked) {
      if (idx === -1) explorerSelectedTags.push(tag);
    } else {
      if (idx !== -1) explorerSelectedTags.splice(idx, 1);
    }
    updateExplorerTagDropdownLabel();
    renderExplorer();
  };

  window.toggleExplorerUntagged = function (checkboxEl) {
    explorerUntagged = checkboxEl.checked;
    if (explorerUntagged) {
      // Clear and disable all regular tag checkboxes
      explorerSelectedTags = [];
      document.querySelectorAll('#explorer-tag-select-dd .ms-option:not(.ms-option-untagged) input[type=checkbox]').forEach(function (cb) {
        cb.checked = false;
        cb.disabled = true;
      });
    } else {
      document.querySelectorAll('#explorer-tag-select-dd .ms-option:not(.ms-option-untagged) input[type=checkbox]').forEach(function (cb) {
        cb.disabled = false;
      });
    }
    updateExplorerTagDropdownLabel();
    renderExplorer();
  };

  window.clearAllExplorerTags = function () {
    explorerSelectedTags = [];
    explorerUntagged = false;
    document.querySelectorAll('#explorer-tag-select-dd .ms-option input[type=checkbox]').forEach(function (cb) {
      cb.checked = false;
      cb.disabled = false;
    });
    updateExplorerTagDropdownLabel();
    renderExplorer();
  };

  function updateExplorerTagDropdownLabel() {
    var el = document.getElementById('explorer-tag-select-label');
    if (!el) return;
    if (explorerUntagged) {
      el.textContent = 'Untagged';
    } else if (explorerSelectedTags.length === 0) {
      el.textContent = 'All tags';
    } else if (explorerSelectedTags.length === 1) {
      el.textContent = explorerSelectedTags[0];
    } else {
      el.textContent = explorerSelectedTags.length + ' tags';
    }
  }

  window.toggleTagAnalysisUntagged = function (checkboxEl) {
    tagAnalysisShowUntagged = checkboxEl.checked;
    if (tagAnalysisShowUntagged) {
      // Clear and disable all regular tag checkboxes
      selectedTags = [];
      document.querySelectorAll('#tag-select-dd .ms-option:not(.ms-option-untagged) input[type=checkbox]').forEach(function (cb) {
        cb.checked = false;
        cb.disabled = true;
      });
      document.querySelectorAll('.tag-pill').forEach(function (p) { p.classList.remove('active'); });
    } else {
      // Re-enable regular tag checkboxes
      document.querySelectorAll('#tag-select-dd .ms-option:not(.ms-option-untagged) input[type=checkbox]').forEach(function (cb) {
        cb.disabled = false;
      });
    }
    updateTagDropdownLabel();
    updateTagCharts();
    // Note: Tag Analysis does NOT affect Test Explorer
  };

  window.toggleTagSelection = function (tag, checkboxEl) {
    // Blocked when UNTAGGED is active (checkboxes are disabled, but handle defensively)
    if (tagAnalysisShowUntagged) { checkboxEl.checked = false; return; }
    var idx = selectedTags.indexOf(tag);
    if (checkboxEl.checked) {
      if (idx === -1) selectedTags.push(tag);
    } else {
      if (idx !== -1) selectedTags.splice(idx, 1);
    }
    // Sync pill active states
    document.querySelectorAll('.tag-pill').forEach(function (pill) {
      pill.classList.toggle('active', selectedTags.indexOf(pill.dataset.tag) !== -1);
    });
    updateTagDropdownLabel();
    updateTagCharts();
    // Note: Tag Analysis does NOT affect Test Explorer
  };

  window.clearAllTags = function () {
    selectedTags = [];
    tagAnalysisShowUntagged = false;
    document.querySelectorAll('#tag-select-dd .ms-option input[type=checkbox]').forEach(function (cb) {
      cb.checked = false;
      cb.disabled = false;
    });
    document.querySelectorAll('.tag-pill').forEach(function (p) { p.classList.remove('active'); });
    updateTagDropdownLabel();
    updateTagCharts();
  };

  window.selectAllTags = function () {
    tagAnalysisShowUntagged = false;
    selectedTags = REPORT_DATA.stats.allTags.slice();
    // Select all regular tags, uncheck/enable UNTAGGED
    document.querySelectorAll('#tag-select-dd .ms-option:not(.ms-option-untagged) input[type=checkbox]').forEach(function (cb) {
      cb.checked = true;
      cb.disabled = false;
    });
    document.querySelectorAll('#tag-select-dd .ms-option-untagged input[type=checkbox]').forEach(function (cb) {
      cb.checked = false;
      cb.disabled = false;
    });
    document.querySelectorAll('.tag-pill').forEach(function (p) { p.classList.add('active'); });
    updateTagDropdownLabel();
    updateTagCharts();
  };

  /* ── Tag pill quick-click ─────────────────────────────────────────────── */
  window.clickTagPill = function (tag) {
    // Don't allow when UNTAGGED is selected
    if (tagAnalysisShowUntagged) return;
    var idx = selectedTags.indexOf(tag);
    if (idx === -1) {
      selectedTags.push(tag);
    } else {
      selectedTags.splice(idx, 1);
    }
    // Sync checkboxes
    document.querySelectorAll('#tag-select-dd .ms-option input[type=checkbox]').forEach(function (cb) {
      if (cb.value === tag) cb.checked = idx === -1; // was not selected → now selected
    });
    // Sync pill active states
    document.querySelectorAll('.tag-pill').forEach(function (pill) {
      pill.classList.toggle('active', selectedTags.indexOf(pill.dataset.tag) !== -1);
    });
    updateTagDropdownLabel();
    updateTagCharts();
    // Note: Tag Analysis does NOT affect Test Explorer
  };

  function updateTagDropdownLabel() {
    var el = document.getElementById('tag-select-label');
    if (!el) return;
    if (tagAnalysisShowUntagged) {
      el.textContent = 'UNTAGGED';
    } else if (selectedTags.length === 0) {
      el.textContent = 'Select tags\u2026';
    } else if (selectedTags.length === 1) {
      el.textContent = selectedTags[0];
    } else {
      el.textContent = selectedTags.length + ' tags selected';
    }
  }

  /* ── Tag Donut Charts ─────────────────────────────────────────────────── */
  function updateTagCharts() {
    var chartsWrap = document.getElementById('tag-charts');
    var emptyState = document.getElementById('tag-charts-empty');
    if (!chartsWrap || !emptyState) return;

    var hasSelection = tagAnalysisShowUntagged || selectedTags.length > 0;
    if (!hasSelection) {
      chartsWrap.style.display = 'none';
      emptyState.style.display = '';
      return;
    }

    chartsWrap.style.display = '';
    emptyState.style.display = 'none';

    var totalSuites = REPORT_DATA.stats.totalSuites;
    var totalTests  = REPORT_DATA.stats.totalTests;
    var matchSuites, matchTests;

    if (tagAnalysisShowUntagged) {
      // Use pre-computed untagged counts
      matchSuites = REPORT_DATA.stats.untaggedSuites || 0;
      matchTests  = REPORT_DATA.stats.untaggedTests  || 0;
    } else {
      // AND logic: suite/test must have ALL selected tags in their effective tag set
      matchSuites = 0;
      matchTests  = 0;

      REPORT_DATA.files.forEach(function (file) {
        function walkSuite(suite, parentTags) {
          var allTags = parentTags.concat(suite.tags);
          totalSuites; // already set above
          var suiteMatches = selectedTags.every(function (st) {
            return allTags.indexOf(st) !== -1;
          });
          if (suiteMatches) matchSuites++;

          suite.tests.forEach(function (t) {
            var combined = allTags.concat(t.tags);
            var tMatches = selectedTags.every(function (st) {
              return combined.indexOf(st) !== -1;
            });
            if (tMatches) matchTests++;
          });

          suite.nestedSuites.forEach(function (ns) {
            walkSuite(ns, allTags);
          });
        }

        file.suites.forEach(function (s) { walkSuite(s, []); });

        file.orphanTests.forEach(function (t) {
          var tMatches = selectedTags.every(function (st) {
            return t.tags.indexOf(st) !== -1;
          });
          if (tMatches) matchTests++;
        });
      });
    }

    setDonut('suites-donut', matchSuites, totalSuites);
    setDonut('tests-donut',  matchTests,  totalTests);

    var suitesCount = document.getElementById('tag-suites-count');
    var testsCount  = document.getElementById('tag-tests-count');
    var suitesSub   = document.getElementById('tag-suites-sub');
    var testsSub    = document.getElementById('tag-tests-sub');

    if (suitesCount) suitesCount.textContent = matchSuites;
    if (testsCount)  testsCount.textContent  = matchTests;
    if (suitesSub)   suitesSub.textContent   = 'of ' + totalSuites + ' suites';
    if (testsSub)    testsSub.textContent    = 'of ' + totalTests + ' tests';
  }

  function setDonut(id, count, total) {
    var pct   = total > 0 ? (count / total) * 100 : 0;
    var ring  = document.querySelector('#' + id + ' .donut-ring');
    var label = document.querySelector('#' + id + ' .pct-num');
    if (ring) ring.setAttribute('stroke-dasharray', pct.toFixed(1) + ' ' + (100 - pct).toFixed(1));
    if (label) label.textContent = Math.round(pct) + '%';

    // Color based on percentage
    var color = pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--accent)';
    if (ring) ring.style.stroke = color;
    var numEl = document.querySelector('#' + id + ' .pct-num');
    if (numEl) numEl.style.color = color;
  }

  /* ── Theme toggle ─────────────────────────────────────────────────────── */
  window.toggleTheme = function () {
    var body = document.body;
    var isDark = body.classList.contains('dark-theme');
    body.classList.toggle('dark-theme',  !isDark);
    body.classList.toggle('light-theme',  isDark);
    var btn = document.getElementById('themeBtn');
    if (btn) btn.innerHTML = isDark ? svgIcon('moon') : svgIcon('sun');
  };

  /* ── Copy summary to clipboard ───────────────────────────────────────── */
  window.copySummary = function () {
    var s = REPORT_DATA.stats;
    var lines = [
      '='.repeat(52),
      'CYPRESS TEST INTELLIGENCE REPORT',
      '='.repeat(52),
      'Generated: ' + REPORT_DATA.generatedAt,
      'Tests path: ' + REPORT_DATA.testsPathRaw,
      '',
      'SUMMARY',
      '-'.repeat(52),
      'Files:          ' + s.totalFiles,
      'Test Suites:    ' + s.totalSuites,
      'Tests:          ' + s.totalTests,
      'Skipped Suites: ' + s.skippedSuites,
      'Only Suites:    ' + s.onlySuites,
      'Skipped Tests:  ' + s.skippedTests,
      'Only Tests:     ' + s.onlyTests,
      'Health Score:   ' + s.healthScore + '%',
      '',
      'TAGS (' + s.allTags.length + '): ' + s.allTags.join(', '),
      '-'.repeat(52),
      'Generated by cypress-test-intelligence',
    ];

    var text = lines.join('\\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('Summary copied!');
      }).catch(function () { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
  };

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0;';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand('copy'); showToast('Summary copied!'); }
    catch (e) { showToast('Could not copy.'); }
    document.body.removeChild(ta);
  }

  /* ── Toast ────────────────────────────────────────────────────────────── */
  var toastTimer = null;
  function showToast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('visible'); }, 3000);
  }

}());
`;
}

module.exports = { getScripts };
