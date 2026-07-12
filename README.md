# vgateway

Static Reveal.js presentation deck about MCP Gateway architecture.

## Requirements

- Node.js 22 or newer
- npm 10 or newer

## Setup

Install the pinned npm dependencies:

```bash
npm install
```

The deck itself is a static HTML page. npm is used to pin the browser-library
versions, run tests with coverage, and run dependency audits.

## Run

Start a local static server:

```bash
npm run serve
```

Then open the printed local URL if the browser does not open automatically.

## Test

Run the unit and integration tests:

```bash
npm test
```

Run tests with the required coverage thresholds:

```bash
npm run test:coverage
```

The coverage configuration enforces at least 93% lines, statements, functions,
and branches for source files under `src/`.

## Dependency audit

Run the npm dependency audit:

```bash
npm run audit
```

The initial repository did not contain a package manifest or lockfile, so npm
audit could not run until this npm project metadata was added.

## Environment

No runtime environment variables are required. The page loads these browser
libraries from pinned jsDelivr CDN URLs:

- reveal.js
- mermaid
- bootstrap-icons
