'use strict';

function getStyles() {
  return `
/* ─── Reset ─────────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; scroll-behavior: smooth; }

/* ─── Design tokens: dark (default) ─────────────────────────────────────── */
:root {
  --bg-body:        #050b17;
  --bg-header:      #030810;
  --bg-card:        #09152280;
  --bg-card-solid:  #091522;
  --bg-card-hover:  #0c1c30;
  --bg-input:       #060d1a;
  --bg-inset:       #040b16;

  --accent:         #00d4c8;
  --accent-bright:  #00ede4;
  --accent-glow:    rgba(0, 212, 200, 0.18);
  --accent-border:  rgba(0, 212, 200, 0.22);
  --accent-border2: rgba(0, 212, 200, 0.40);

  --success:        #00e676;
  --success-dim:    rgba(0, 230, 118, 0.70);
  --success-glow:   rgba(0, 230, 118, 0.14);
  --success-border: rgba(0, 230, 118, 0.30);

  --danger:         #ff4757;
  --danger-dim:     rgba(255, 71, 87, 0.70);
  --danger-glow:    rgba(255, 71, 87, 0.14);
  --danger-border:  rgba(255, 71, 87, 0.30);

  --warning:        #ffa502;
  --warning-dim:    rgba(255, 165, 2, 0.70);
  --warning-glow:   rgba(255, 165, 2, 0.14);
  --warning-border: rgba(255, 165, 2, 0.30);

  --info:           #54a0ff;
  --info-glow:      rgba(84, 160, 255, 0.14);
  --info-border:    rgba(84, 160, 255, 0.30);

  --text-1:  #f0f6ff;
  --text-2:  #b8ccdf;
  --text-3:  #6b87a4;
  --text-4:  #344e66;

  --border-1: rgba(0, 212, 200, 0.07);
  --border-2: rgba(0, 212, 200, 0.14);
  --border-3: rgba(0, 212, 200, 0.28);

  --radius-sm: 6px;
  --radius:    10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  --shadow-sm:   0 2px 8px rgba(0,0,0,0.35);
  --shadow-md:   0 4px 24px rgba(0,0,0,0.45);
  --shadow-lg:   0 8px 48px rgba(0,0,0,0.55);
  --shadow-glow: 0 0 40px rgba(0, 212, 200, 0.06);

  --font-mono: 'SF Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
}

/* ─── Design tokens: light override ─────────────────────────────────────── */
body.light-theme {
  --bg-body:        #eef2f8;
  --bg-header:      #ffffff;
  --bg-card:        rgba(255,255,255,0.85);
  --bg-card-solid:  #ffffff;
  --bg-card-hover:  #f7faff;
  --bg-input:       #f0f4f8;
  --bg-inset:       #e8edf5;

  --text-1:  #0f1923;
  --text-2:  #243346;
  --text-3:  #5a7898;
  --text-4:  #9cb3c9;

  --border-1: rgba(0,0,0,0.06);
  --border-2: rgba(0,0,0,0.11);
  --border-3: rgba(0,0,0,0.22);

  --shadow-sm:   0 2px 8px rgba(0,0,0,0.08);
  --shadow-md:   0 4px 24px rgba(0,0,0,0.12);
  --shadow-lg:   0 8px 48px rgba(0,0,0,0.16);
  --shadow-glow: none;
}

/* ─── Base body ──────────────────────────────────────────────────────────── */
body {
  background-color: var(--bg-body);
  color: var(--text-2);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, sans-serif;
  line-height: 1.6;
  min-height: 100vh;
}

body.dark-theme::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,212,200,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,212,200,0.025) 1px, transparent 1px);
  background-size: 52px 52px;
  pointer-events: none;
  z-index: 0;
}

.app { position: relative; z-index: 1; }

/* ─── Layout ─────────────────────────────────────────────────────────────── */
.main      { padding: 24px 16px 60px; }
.container { max-width: 1400px; margin: 0 auto; }

/* ─── Header ─────────────────────────────────────────────────────────────── */
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  height: 64px;
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-2);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.logo-placeholder {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #0088ff);
  box-shadow: 0 0 12px var(--accent-glow), 0 0 24px var(--accent-glow);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.logo-placeholder svg { width: 20px; height: 20px; color: #fff; }

.logo-img {
  width: 36px; height: 36px;
  object-fit: contain;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.header-title { line-height: 1.2; }
.header-title h1 {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--text-1);
}
body.dark-theme .header-title h1 {
  background: linear-gradient(120deg, var(--text-1) 40%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.header-title .subtitle { font-size: 0.72rem; color: var(--text-3); }
.header-title .custom-title { font-size: 0.8rem; color: var(--accent); font-weight: 600; }

.header-spacer { flex: 1; }

.header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.icon-btn {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  background: transparent;
  border: 1px solid var(--border-2);
  border-radius: var(--radius-sm);
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.2s;
}
.icon-btn:hover {
  border-color: var(--accent-border2);
  color: var(--accent);
  background: var(--accent-glow);
}
.icon-btn svg { width: 16px; height: 16px; }

/* ─── Section spacing ────────────────────────────────────────────────────── */
.section { margin-bottom: 20px; }

/* ─── Card ───────────────────────────────────────────────────────────────── */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-2);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md), var(--shadow-glow);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* ─── Overview / Summary ─────────────────────────────────────────────────── */
.summary-card { padding: 28px 28px 22px; }

.summary-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.summary-heading { flex: 1; }
.summary-heading h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.01em;
  margin-bottom: 4px;
}
.summary-heading p { font-size: 0.82rem; color: var(--text-3); }

/* ─── Donut chart ────────────────────────────────────────────────────────── */
.risk-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.risk-label-top {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--text-3);
  text-transform: uppercase;
}
.donut-wrap { position: relative; width: 90px; height: 90px; }
.donut-svg  { width: 90px; height: 90px; transform: rotate(-90deg); }
.donut-track { fill: none; stroke: var(--border-1); stroke-width: 4; }
.donut-ring  {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  transition: stroke-dasharray 0.6s ease;
}
.donut-pct {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  line-height: 1;
}
.donut-pct .pct-num {
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.donut-pct .pct-sym { font-size: 0.65rem; color: var(--text-3); }
.risk-label-bottom {
  font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
}
.risk-low    { color: var(--success); }
.risk-medium { color: var(--warning); }
.risk-high   { color: var(--danger);  }

/* ─── Stats grid ─────────────────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
}
@media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 700px)  { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 400px)  { .stats-grid { grid-template-columns: 1fr; } }

.stat-card {
  background: var(--bg-inset);
  border: 1px solid var(--border-1);
  border-radius: var(--radius);
  padding: 14px 16px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.stat-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 3px 0 0 3px;
  background: var(--stat-color, var(--accent));
}
.stat-card:hover { border-color: var(--border-2); box-shadow: var(--shadow-sm); }
.stat-value {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--stat-color, var(--text-1));
  line-height: 1;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 0.72rem;
  color: var(--text-3);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.stat-sub { font-size: 0.68rem; color: var(--text-4); margin-top: 2px; }

/* ─── Tags Section ───────────────────────────────────────────────────────── */
.tags-card { padding: 24px 28px; }

.section-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.section-heading h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.01em;
}
.section-badge {
  font-size: 0.7rem;
  font-weight: 700;
  background: var(--accent-glow);
  color: var(--accent);
  border: 1px solid var(--accent-border);
  border-radius: 20px;
  padding: 2px 9px;
}

/* Multi-select dropdown */
.tag-controls {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.multi-select { position: relative; min-width: 260px; }
.multi-select-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border-2);
  border-radius: var(--radius);
  color: var(--text-2);
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.2s;
  text-align: left;
}
.multi-select-btn:hover, .multi-select-btn.open {
  border-color: var(--accent-border2);
  background: var(--bg-card-hover);
}
.multi-select-btn svg { color: var(--text-3); flex-shrink: 0; transition: transform 0.2s; }
.multi-select-btn.open svg { transform: rotate(180deg); }
.multi-select-btn-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.multi-select-dropdown {
  /* position/top/left/width/max-height/z-index are set dynamically by JS
     (position:fixed + portal to <body>) to escape backdrop-filter stacking contexts */
  min-width: 260px;
  background: var(--bg-card-solid);
  border: 1px solid var(--border-3);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  display: none;
  /* Flex column so .ms-options can fill remaining space and scroll */
  flex-direction: column;
  overflow: hidden;
}
.multi-select-dropdown.open { display: flex; }

.ms-divider {
  height: 1px;
  background: var(--border-2);
  margin: 2px 0;
}

.ms-search {
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-1);
}
.ms-search input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border-2);
  border-radius: var(--radius-sm);
  padding: 5px 10px;
  color: var(--text-1);
  font-size: 0.82rem;
  outline: none;
}
.ms-search input:focus { border-color: var(--accent-border2); }

.ms-options {
  /* Fill remaining height inside the flex dropdown and scroll if needed */
  flex: 1 1 0%;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 0;
}
.ms-options::-webkit-scrollbar { width: 4px; }
.ms-options::-webkit-scrollbar-track { background: transparent; }
.ms-options::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 2px; }

.ms-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  cursor: pointer;
  font-size: 0.84rem;
  color: var(--text-2);
  transition: background 0.15s;
  user-select: none;
}
.ms-option:hover { background: var(--bg-card-hover); }
.ms-option input[type=checkbox] { accent-color: var(--accent); width: 14px; height: 14px; cursor: pointer; }
.ms-option-label { flex: 1; font-family: var(--font-mono); font-size: 0.8rem; }
.ms-option-count {
  font-size: 0.72rem;
  color: var(--text-4);
  background: var(--bg-inset);
  border-radius: 20px;
  padding: 1px 7px;
  flex-shrink: 0;
}

.ms-footer {
  display: flex;
  justify-content: space-between;
  padding: 8px 10px;
  border-top: 1px solid var(--border-1);
  gap: 6px;
}
.ms-footer button {
  flex: 1;
  padding: 5px 10px;
  font-size: 0.76rem;
  background: var(--bg-inset);
  border: 1px solid var(--border-2);
  border-radius: var(--radius-sm);
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.15s;
}
.ms-footer button:hover { border-color: var(--accent-border); color: var(--accent); }

/* Tag donut charts */
.tag-charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 600px) { .tag-charts-grid { grid-template-columns: 1fr; } }

.tag-chart-card {
  background: var(--bg-inset);
  border: 1px solid var(--border-1);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 24px;
}
.tag-chart-donut { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
.tag-chart-donut .donut-svg { width: 80px; height: 80px; }
.tag-chart-donut .donut-pct .pct-num { font-size: 1.1rem; }

.tag-chart-info { flex: 1; }
.tag-chart-info h3 {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-3);
  margin-bottom: 6px;
}
.tag-chart-stat {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.02em;
  line-height: 1;
}
.tag-chart-sub { font-size: 0.78rem; color: var(--text-3); margin-top: 4px; }

.tag-empty-state {
  text-align: center;
  color: var(--text-4);
  font-size: 0.85rem;
  padding: 32px 20px;
  border: 1px dashed var(--border-2);
  border-radius: var(--radius);
}
.tag-empty-state svg { margin-bottom: 8px; opacity: 0.4; }

/* Tag pills */
.tag-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.tag-pill {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  padding: 3px 9px;
  border-radius: 20px;
  background: var(--accent-glow);
  color: var(--accent);
  border: 1px solid var(--accent-border);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.tag-pill:hover, .tag-pill.active {
  background: var(--accent-border2);
  color: var(--bg-body);
  border-color: var(--accent);
}
body.light-theme .tag-pill:hover,
body.light-theme .tag-pill.active { color: #003333; }

.untagged-pill {
  background: var(--warning-glow);
  color: var(--warning);
  border-color: var(--warning-border);
}
.untagged-pill:hover, .untagged-pill.active {
  background: var(--warning);
  color: #000;
}

/* ─── Issues Section ─────────────────────────────────────────────────────── */
.issues-card { padding: 24px 28px; }

.issues-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.issue-group { }

.issue-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-3);
  margin-bottom: 10px;
}
.issue-count-badge {
  font-size: 0.68rem;
  padding: 1px 7px;
  border-radius: 20px;
  font-weight: 700;
}
.badge-warning { background: var(--warning-glow); color: var(--warning); border: 1px solid var(--warning-border); }
.badge-danger  { background: var(--danger-glow);  color: var(--danger);  border: 1px solid var(--danger-border);  }
.badge-info    { background: var(--info-glow);    color: var(--info);    border: 1px solid var(--info-border);    }

.issue-list { display: flex; flex-direction: column; gap: 6px; }

.issue-item {
  background: var(--bg-inset);
  border: 1px solid var(--border-1);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  font-size: 0.82rem;
  transition: border-color 0.15s;
}
.issue-item:hover { border-color: var(--border-2); }
.issue-item-name {
  color: var(--text-1);
  font-weight: 600;
  margin-bottom: 2px;
  word-break: break-word;
}
.issue-item-files {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.issue-item-file {
  font-family: var(--font-mono);
  font-size: 0.73rem;
  color: var(--text-3);
  word-break: break-all;
}
.issue-item-file span { color: var(--text-4); }

.issues-none {
  text-align: center;
  padding: 24px;
  color: var(--success);
  font-size: 0.85rem;
}
.issues-none svg { margin-bottom: 6px; opacity: 0.8; }

/* ─── Explorer Section ───────────────────────────────────────────────────── */
.explorer-card { padding: 24px 28px; }

.explorer-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.control-label {
  font-size: 0.75rem;
  color: var(--text-3);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.ctrl-select {
  padding: 6px 10px;
  background: var(--bg-input);
  border: 1px solid var(--border-2);
  border-radius: var(--radius-sm);
  color: var(--text-2);
  font-size: 0.82rem;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}
.ctrl-select:hover, .ctrl-select:focus { border-color: var(--accent-border2); color: var(--text-1); }

.filter-tabs { display: flex; gap: 4px; }
.filter-tab {
  padding: 5px 12px;
  font-size: 0.78rem;
  font-weight: 600;
  background: var(--bg-input);
  border: 1px solid var(--border-2);
  border-radius: var(--radius-sm);
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.filter-tab:hover { border-color: var(--accent-border); color: var(--accent); }
.filter-tab.active {
  background: var(--accent-glow);
  border-color: var(--accent-border2);
  color: var(--accent);
}
.filter-tab.ft-skip.active  { background: var(--warning-glow); border-color: var(--warning-border); color: var(--warning); }
.filter-tab.ft-only.active  { background: var(--info-glow);    border-color: var(--info-border);    color: var(--info);    }
.filter-tab.ft-notag.active { background: var(--danger-glow);  border-color: var(--danger-border);  color: var(--danger);  }

.explorer-actions { margin-left: auto; display: flex; gap: 6px; }

.btn-ghost {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  font-size: 0.78rem;
  background: transparent;
  border: 1px solid var(--border-2);
  border-radius: var(--radius-sm);
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.15s;
}
.btn-ghost:hover {
  border-color: var(--accent-border);
  color: var(--accent);
  background: var(--accent-glow);
}

/* ─── File Card ──────────────────────────────────────────────────────────── */
.file-card {
  background: var(--bg-card);
  border: 1px solid var(--border-1);
  border-radius: var(--radius);
  margin-bottom: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.file-card:hover  { border-color: var(--border-2); }
.file-card.has-skip { border-left: 3px solid var(--warning); }
.file-card.has-only { border-left: 3px solid var(--info); }
.file-card.is-hidden { display: none !important; }

.file-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}
.file-header:hover { background: var(--bg-card-hover); }

.file-status-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 6px var(--accent-glow);
  flex-shrink: 0;
}
.file-card.has-skip .file-status-dot { background: var(--warning); box-shadow: 0 0 6px var(--warning-glow); }
.file-card.has-only .file-status-dot { background: var(--info);    box-shadow: 0 0 6px var(--info-glow); }

.file-name {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--text-1);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-folder { color: var(--text-3); }

.file-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.file-badges { display: flex; gap: 4px; flex-wrap: wrap; }

.badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
  white-space: nowrap;
}
.badge-tests   { background: var(--accent-glow);   color: var(--accent);   border: 1px solid var(--accent-border); }
.badge-suites  { background: var(--bg-inset);      color: var(--text-3);   border: 1px solid var(--border-1); }
.badge-skip    { background: var(--warning-glow);  color: var(--warning);  border: 1px solid var(--warning-border); }
.badge-only    { background: var(--info-glow);     color: var(--info);     border: 1px solid var(--info-border); }
.badge-size    { background: var(--bg-inset);      color: var(--text-4);   border: 1px solid var(--border-1); font-family: var(--font-mono); font-size: 0.66rem; }

.expand-btn {
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-3);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.15s;
  flex-shrink: 0;
}
.expand-btn:hover { color: var(--accent); background: var(--accent-glow); }
.expand-btn svg { transition: transform 0.2s; }
.file-card.expanded .expand-btn svg { transform: rotate(180deg); }

/* ─── File body (suites + tests) ─────────────────────────────────────────── */
.file-body {
  display: none;
  padding: 0 16px 12px;
  border-top: 1px solid var(--border-1);
}
.file-card.expanded .file-body { display: block; }

.suite-block {
  padding: 8px 0;
  border-bottom: 1px solid var(--border-1);
}
.suite-block:last-child { border-bottom: none; }

.suite-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  margin-bottom: 4px;
}
.suite-name {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--text-1);
  flex: 1;
}
.suite-tags { display: flex; gap: 4px; flex-wrap: wrap; }

.modifier-badge {
  font-size: 0.66rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex-shrink: 0;
}
.modifier-skip { background: var(--warning-glow); color: var(--warning); border: 1px solid var(--warning-border); }
.modifier-only { background: var(--info-glow);    color: var(--info);    border: 1px solid var(--info-border); }

.tests-list { padding-left: 16px; }

.test-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  border-radius: var(--radius-sm);
  transition: background 0.1s;
}
.test-row:hover { background: var(--bg-card-hover); }

.test-icon {
  width: 16px; height: 16px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.icon-normal { color: var(--accent); }
.icon-skip   { color: var(--warning); }
.icon-only   { color: var(--info); }

.test-name {
  flex: 1;
  font-size: 0.81rem;
  color: var(--text-2);
  word-break: break-word;
}
.test-name.is-skip { color: var(--text-4); text-decoration: line-through; }
.test-name.is-only { color: var(--info); }

.test-tags { display: flex; gap: 4px; flex-wrap: wrap; flex-shrink: 0; }

.test-tag-pill {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  padding: 1px 6px;
  border-radius: 20px;
  background: var(--accent-glow);
  color: var(--accent);
  border: 1px solid var(--accent-border);
  white-space: nowrap;
}

.nested-suite {
  margin-left: 16px;
  border-left: 2px solid var(--border-1);
  padding-left: 10px;
  margin-top: 6px;
}

.orphan-tests {
  margin-top: 4px;
  padding: 6px 0;
  border-top: 1px dashed var(--border-1);
}
.orphan-label {
  font-size: 0.7rem;
  color: var(--text-4);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}

/* ─── No results / empty state ───────────────────────────────────────────── */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-4);
}
.no-results svg { margin-bottom: 12px; opacity: 0.4; }
.no-results p   { font-size: 0.9rem; }

/* ─── Toast ──────────────────────────────────────────────────────────────── */
#toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--bg-card-solid);
  border: 1px solid var(--accent-border2);
  color: var(--accent);
  padding: 10px 18px;
  border-radius: var(--radius);
  font-size: 0.84rem;
  box-shadow: var(--shadow-lg);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.25s, transform 0.25s;
  pointer-events: none;
  z-index: 999;
}
#toast.visible { opacity: 1; transform: none; }

/* ─── Scrollbar ──────────────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--border-3); }

/* ─── UNTAGGED option in dropdowns ──────────────────────────────────────── */
.ms-option-untagged .ms-option-label {
  color: var(--danger);
  font-weight: 700;
}
.ms-option-untagged:hover { background: var(--danger-glow); }

/* ─── Modifier badge: untagged ───────────────────────────────────────────── */
.modifier-untagged {
  background: var(--danger-glow);
  color: var(--danger);
  border: 1px solid var(--danger-border);
}

/* ─── Explorer tag select ────────────────────────────────────────────────── */
.explorer-tag-select { min-width: 160px; }

/* ─── Explorer search row ────────────────────────────────────────────────── */
.explorer-search-row { margin-bottom: 16px; }

.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-input);
  border: 1px solid var(--border-2);
  border-radius: var(--radius-xl);
  padding: 6px 14px;
  width: 100%;
  transition: border-color 0.2s;
}
.search-wrap:focus-within {
  border-color: var(--accent-border2);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.search-wrap svg { color: var(--text-3); flex-shrink: 0; }
.search-input {
  background: none;
  border: none;
  outline: none;
  color: var(--text-1);
  font-size: 0.85rem;
  width: 100%;
}
.search-input::placeholder { color: var(--text-4); }

/* ─── Buy-me-a-coffee button ─────────────────────────────────────────────── */
.bmc-btn {
  display: flex;
  align-items: center;
  text-decoration: none;
  border-radius: var(--radius-sm);
  overflow: hidden;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  transition: opacity 0.2s, transform 0.15s;
}
.bmc-btn:hover { opacity: 0.85; transform: translateY(-1px); }
.bmc-gif { display: block; width: 34px; height: 34px; object-fit: cover; }

/* ─── Environment section ────────────────────────────────────────────────── */
.env-card { padding: 20px 28px; }

.env-title {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
  color: var(--text-3);
  margin-bottom: 16px;
}

.env-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.env-key {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-4);
  margin-bottom: 2px;
}

.env-val {
  font-size: 0.82rem;
  color: var(--text-2);
  font-family: var(--font-mono);
}

.env-val-path {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
.report-footer {
  text-align: center;
  padding: 16px;
  font-size: 0.75rem;
  color: var(--text-4);
  border-top: 1px solid var(--border-1);
}

/* ─── Responsive tweaks ──────────────────────────────────────────────────── */
@media (max-width: 700px) {
  .header { padding: 0 14px; gap: 10px; }
  .summary-card, .tags-card, .issues-card, .explorer-card { padding: 16px; }
  .summary-top { flex-direction: column-reverse; align-items: flex-start; }
  .explorer-controls { flex-direction: column; align-items: flex-start; }
  .explorer-actions { margin-left: 0; }
  .tag-controls { flex-direction: column; }
}
`;
}

module.exports = { getStyles };
