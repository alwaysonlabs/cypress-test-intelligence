#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');
const { run } = require('../src/generator');

const args = process.argv.slice(2);

function showHelp() {
  console.log(`
  cypress-test-intelligence — Scan Cypress tests & generate an HTML insight report

  Usage:
    cypress-test-intelligence [options]
    cypress-test-intelligence --config <file>

  Options:
    --config <file>            Load options from a JSON config file
                               CLI flags override any values in the file

    --path <path>              Path to Cypress test files   [default: cypress/e2e]
    --exclude <folders>        Comma-separated folders to exclude
                               e.g. --exclude "cypress/examples,cypress/tutorial"
    -o, --output <path>        Output HTML file path        [default: ./cypress-test-intelligence.html]
    -t, --title <text>         Page title                   [default: Cypress Test Intelligence]
    --overview-text <text>     Custom text shown in the Test Overview section
    --logo <path|url>          Custom logo (local file path or URL)
    --theme dark|light         Color theme                  [default: dark]
    --sort alpha|tests|size    Initial sort order           [default: alpha]
    --open                     Open report in browser after generation
    --no-support-button        Hide the "Buy me a coffee" button
    --no-environment           Hide the Environment section
    --no-tags                  Hide all tag-related UI (Tag Analysis section,
                               Tags filter, Untagged label in Test Explorer)
    -h, --help                 Show this help message

  Config file format (JSON):
    {
      "path": "cypress/e2e",
      "exclude": "folder1,folder2",
      "output": "./report.html",
      "title": "My App Tests",
      "overviewText": "Custom description shown in the Test Overview section.",
      "logo": "./assets/logo.png",
      "theme": "dark",
      "sort": "alpha",
      "open": false,
      "showSupportButton": true,
      "showEnvironment": true,
      "showTags": true
    }

  Examples:
    cypress-test-intelligence
    cypress-test-intelligence --path src/tests --theme light --open
    cypress-test-intelligence --config my-report-config.json
    cypress-test-intelligence --config ci.json --open
    cypress-test-intelligence --exclude "cypress/examples" -t "My App Tests"
    cypress-test-intelligence --no-tags --no-support-button
  `);
  process.exit(0);
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function getArg(flags, defaultVal) {
  for (const flag of Array.isArray(flags) ? flags : [flags]) {
    const idx = args.indexOf(flag);
    if (idx !== -1 && args[idx + 1]) {
      return args[idx + 1];
    }
  }
  return defaultVal;
}

function hasFlag(flags) {
  return (Array.isArray(flags) ? flags : [flags]).some(f => args.includes(f));
}

// Returns CLI arg value or null if flag not present
function cliStr(flags) {
  return getArg(flags, null);
}

if (hasFlag(['-h', '--help'])) showHelp();

/* ─── Load config file ────────────────────────────────────────────────────── */

let fileConfig = {};
const configFile = cliStr('--config');
if (configFile) {
  try {
    const cfPath = path.resolve(process.cwd(), configFile);
    fileConfig = JSON.parse(fs.readFileSync(cfPath, 'utf-8'));
  } catch (err) {
    console.error(`\nError reading config file "${configFile}": ${err.message}`);
    process.exit(1);
  }
}

/* ─── Merge helper: CLI > file config > default ──────────────────────────── */

function cfg(cliVal, fileKey, defaultVal) {
  if (cliVal !== null && cliVal !== undefined) return cliVal;
  if (fileConfig[fileKey] !== undefined)       return fileConfig[fileKey];
  return defaultVal;
}

// For boolean flags with --no-X pattern: returns false|true|null (null = not specified on CLI)
function cliBool(negFlag, posFlag) {
  if (hasFlag(negFlag))                      return false;
  if (posFlag && hasFlag(posFlag))           return true;
  return null;
}

/* ─── Parse options ───────────────────────────────────────────────────────── */

const testsPath         = cfg(cliStr('--path'),           'path',               'cypress/e2e');
const outputPath        = cfg(cliStr(['-o', '--output']), 'output',             './cypress-test-intelligence.html');
const pageTitle         = cfg(cliStr(['-t', '--title']),  'title',              null);
const overviewText      = cfg(cliStr('--overview-text'),  'overviewText',       undefined);
const logo              = cfg(cliStr('--logo'),           'logo',               null);
const theme             = cfg(cliStr('--theme'),          'theme',              'dark');
const sort              = cfg(cliStr('--sort'),           'sort',               'alpha');
const excludeRaw        = cfg(cliStr('--exclude'),        'exclude',            null);
const openReport        = cfg(hasFlag('--open') || null,  'open',               false);
const showSupportButton = cfg(cliBool('--no-support-button'), 'showSupportButton', true);
const showEnvironment   = cfg(cliBool('--no-environment'),    'showEnvironment',   true);
const showTags          = cfg(cliBool('--no-tags'),           'showTags',          true);

const excludeFolders = excludeRaw
  ? excludeRaw.split(',').map(s => s.trim()).filter(Boolean)
  : [];

const options = {
  testsPath:          path.resolve(process.cwd(), testsPath),
  testsPathRaw:       testsPath,
  excludeFolders,
  outputPath:         path.resolve(process.cwd(), outputPath),
  pageTitle,
  overviewText,
  logo,
  theme:              ['dark', 'light'].includes(theme) ? theme : 'dark',
  sort:               ['alpha', 'tests', 'size'].includes(sort) ? sort : 'alpha',
  openReport:         Boolean(openReport),
  showSupportButton:  Boolean(showSupportButton),
  showEnvironment:    Boolean(showEnvironment),
  showTags:           Boolean(showTags),
};

run(options).catch(err => {
  console.error('\nError generating report:', err.message);
  process.exit(1);
});
