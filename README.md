# documentation-ivaconsulta

This repository now hosts the Docusaurus app directly at its root (the old `ivaconsulta-docs/` folder has been removed). Everything below assumes you are already inside `/Users/macnolo/Desktop/Code/DocumentationIva`.

## Installation

```bash
npm install
```

## Local development

```bash
npm run start
```

This starts the dev server and opens the browser. Edits are hot-reloaded without restarting.

## Build

```bash
npm run build
```

The static site is output to `build/` and can be deployed to any static host.

## Deployment

Using SSH:

```bash
USE_SSH=true npm run deploy
```

Not using SSH:

```bash
GIT_USER=<your GitHub username> npm run deploy
```

When deploying to GitHub Pages, this command builds the site and pushes to `gh-pages`.
