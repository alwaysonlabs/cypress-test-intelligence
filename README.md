# Cypress Test Intelligence

Static analysis reports for your Cypress test suite — no test run required.

Scan your test files and instantly generate a rich HTML report with a health score, tag analysis, duplicate detection, and a full interactive test explorer. Works on `.cy.js`, `.cy.ts`, `.spec.*`, and `.test.*` files.

---

## Preview

Sample report available [here](https://alwaysonlabs.github.io/cypress-test-intelligence/report.example.html).

![Preview](assets/preview.gif)

---

## Features

- **No test run needed** — parses source files directly
- **Health score** — based on skipped and `.only` tests
- **Tag analysis** — distribution charts for `@smoke`, `@regression`, etc.
- **Issue detection** — flags empty suites and duplicate test/suite names
- **Test Explorer** — search, filter by tag/folder/modifier, sort, expand/collapse
- **Dark & light themes** — toggle in the report or set at generation time
- **Fully self-contained** — a single portable HTML file, no external dependencies

---

## Installation

### Global (run from any project)

```bash
npm install -g @alwaysonlabs/cypress-test-intelligence
cypress-test-intelligence --path cypress/e2e --open
```

### Local (per project)

```bash
npm install --save-dev @alwaysonlabs/cypress-test-intelligence
npx cypress-test-intelligence --path cypress/e2e --open
```

---

## Quick Start

Run from the root of your project (where `cypress/` lives):

```bash
npx cypress-test-intelligence
```

This scans `./cypress/e2e`, writes `./cypress-test-intelligence.html`, and prints the output path. Open the file in any browser.

---

## CLI Options

```bash
cypress-test-intelligence [options]
cypress-test-intelligence --config <file>
```

| Flag | Description | Default |
| -- | -- | -- |
| `--config <file>` | Load options from a JSON config file (CLI flags override) | — |
| `--path <path>` | Path to Cypress test files | `cypress/e2e` |
| `--exclude <folders>` | Comma-separated folder names to exclude | — |
| `-o, --output <path>` | Output HTML file path | `./cypress-test-intelligence.html` |
| `-t, --title <text>` | Report page title | `Cypress Test Intelligence` |
| `--overview-text <text>` | Custom description in the Test Overview section | built-in sentence |
| `--logo <path\|url>` | Custom logo — local file path or URL | layers icon |
| `--theme dark\|light` | Color theme | `dark` |
| `--sort alpha\|tests\|size` | Initial sort order in Test Explorer | `alpha` |
| `--open` | Open the report in a browser after generation | `false` |
| `--no-support-button` | Hide the "Buy me a coffee" button | shown |
| `--no-environment` | Hide the Environment section | shown |
| `--no-tags` | Hide all tag-related UI (see below) | shown |
| `-h, --help` | Show help | — |

### `--no-tags` in detail

When tags are not used in a project, pass `--no-tags` to produce a cleaner report. This removes:

- The entire **Tag Analysis** section
- The **Tags** filter dropdown in Test Explorer
- The **Untagged** filter tab in Test Explorer

### `--logo`

Accepts a local file path (PNG, JPG, SVG, GIF, WebP) or any URL. Local files are embedded as base64 so the report stays self-contained.

```bash
# Local file
cypress-test-intelligence --logo ./assets/my-logo.png

# URL
cypress-test-intelligence --logo https://example.com/logo.svg
```

---

## Config File

For repeatable or CI runs, store your options in a JSON config file and point to it with `--config`. Any CLI flag you pass alongside `--config` will override the corresponding value in the file.

```bash
npx cypress-test-intelligence --config report-options.json
npx cypress-test-intelligence --config report-options.json --open   # override: open after generation
```

### Config file format

```json
{
  "path": "cypress/e2e",
  "exclude": "cypress/examples,cypress/fixtures",
  "output": "./reports/test-report.html",
  "title": "My App — Test Report",
  "overviewText": "Automated test coverage for the billing and auth flows.",
  "logo": "./assets/logo.png",
  "theme": "dark",
  "sort": "alpha",
  "open": false,
  "showSupportButton": true,
  "showEnvironment": true,
  "showTags": true
}
```

All keys are optional and fall back to the same defaults as the CLI.

---

## Examples

```bash
# Basic run, open in browser
npx cypress-test-intelligence --open

# Different test folder, light theme
npx cypress-test-intelligence --path src/tests --theme light --open

# Custom output path and title
npx cypress-test-intelligence -o reports/nightly.html -t "Nightly Suite"

# Exclude folders
npx cypress-test-intelligence --exclude "cypress/examples,cypress/fixtures"

# Project with no tags — clean report without tag UI
npx cypress-test-intelligence --no-tags

# Minimal report for CI (no support button, no environment footer)
npx cypress-test-intelligence --no-support-button --no-environment -o reports/ci.html

# Using a config file
npx cypress-test-intelligence --config report-options.json --open
```

---

## npm Script Integration

Add a script to `package.json` so anyone on the team can generate the report with a single command:

```json
{
  "scripts": {
    "test:report": "cypress-test-intelligence --config report-options.json --open"
  }
}
```

Then run:

```bash
npm run test:report
```

---

## Report Sections

| Section | Description |
| -- | -- |
| **Test Overview** | File, suite, and test counts; health score donut; skipped/only breakdown |
| **Tag Analysis** | Per-tag suite and test counts; multi-select filter with distribution charts |
| **Issues** | Empty suites, duplicate suite names, duplicate test names |
| **Test Explorer** | Full interactive list with search, folder/tag/modifier filters, sort, expand/collapse |
| **Environment** | Test path, Node.js version, platform, tool version, generation timestamp |

---

## Requirements

- Node.js 14 or later
- Cypress test files (`.cy.js`, `.cy.ts`, `.spec.js`, `.spec.ts`, `.test.js`, `.test.ts`)

---

## License

MIT — [AlwaysOnLabs](https://github.com/alwaysonlabs)
