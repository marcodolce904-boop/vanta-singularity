# CAT-ALOG 🐱

**A personal, offline desktop catalog for web-design building blocks.** Keep your HTML/CSS/JS components, layouts, animations, interactions, CSS classes and `:root` design tokens in one place. Preview them live, copy them, export them, and reuse them in any project.

> Windows desktop app (Electron). Everything stays on your computer: no account, no cloud, no network calls. The interface is in Italian.

![status](https://img.shields.io/badge/platform-Windows-blue) ![offline](https://img.shields.io/badge/works-offline-green) ![tests](https://img.shields.io/badge/tests-146%20passing-brightgreen)

---

## What it is for

Front-end work means rebuilding the same things again and again: a navbar, an off-canvas menu, a pricing card, a responsive grid, a colour palette. CAT-ALOG is a **personal component library with a built-in workshop**:

- a ready-made starting library (**170 items**: 36 layouts, 93 components, 22 animations, 19 interactions, plus 12 groups of CSS classes);
- an editor with live preview at any screen width, quality checks and version history;
- tools around it: responsive media queries, typography scales, design tokens, icons, SEO tags, a page builder, and a visual **CSS Grid playground**.

Everything you save is stored as plain files (`markup.html`, `style.css`, `script.js`), so it works with Git, VS Code and any other editor.

## Who it is for

- **Freelance web designers and front-end developers** who want their own reusable kit instead of hunting through old projects.
- **Designers who code a little** and want quick, accessible, high-contrast building blocks with live previews.
- **Students and learners** who want to see how a component is built, tweak it, and watch the result immediately.
- Anyone who wants an **offline, private** alternative to online snippet managers.

It is a personal tool, not a framework: you copy what you need into your own projects.

## How it works

```
                 ┌──────────────────────────────┐
 CAT-ALOG app ───┤                              │
 VS Code ext. ───┤  Catalog folder (plain files)│  ← Documents\Catalogo MD
 Claude (MCP) ───┤  markup.html · style.css ·   │
                 │  script.js · meta.json       │
                 └──────────────────────────────┘
```

- Each item is a folder with real files. The app, the VS Code extension and the Claude connector all read and write **the same files** with the same rules (unique names, automatic version snapshots, recoverable trash).
- Previews run in an **isolated sandboxed frame** with the catalog's `:root` variables and classes applied, so what you see is what you export.
- The default palette is **neutral and high-contrast** (checked against WCAG AA), and all classes use the `cat-` prefix (configurable).

## Features

| Tab | What you get |
|---|---|
| **Structures / Components / Animations / Interactions** | Browse, search, edit HTML/CSS/JS with syntax colours, live preview (any width, rotate, dark mode, reduced motion, 8px grid), quality check, versions, favourites, export to files or PNG |
| **Pages** | Assemble full pages from catalog items, de-duplicate CSS, export a page or an entire starter-site kit |
| **CSS Grid** | Visual playground: presets (holy grail, sidebar, dashboard, magazine, hero), drag-and-drop areas, resize handles, editable tracks, gaps, `place-items`, live code and a live responsive preview |
| **Classes** | `cat-` utility classes including a Bootstrap-style container / row / column system |
| **Responsive** | Ready-to-copy media queries and container queries, with an indicator of which ones match right now |
| **Typography** | Font pairings and fluid `clamp()` type scales |
| **Assets** | Images, video, Lottie and fonts used by your items |
| **Icons** | Stroke SVG icon set, sprite builder, SVG cleaner |
| **UI Texts** | Interface strings in several languages (JSON export) |
| **Head & SEO** | Title, description, Open Graph, Google-style preview and checks |
| **Root** | `:root` variables, palette presets, contrast checker, colour tools (50–900 scales, colour-blindness simulation), export to CSS / SCSS / JSON / Bootstrap overrides / Figma tokens |

Also: global search (`Ctrl+K`), backup and restore to ZIP, three themes (Cats, Cats dark, Classic), and "Open in VS Code".

## Connectors

- **Claude connector (MCP server)**, in `mcp/`. Lets Claude Desktop or Claude Code list, read, create and update catalog items, run the quality check, build a preview page and change `:root` variables. Runs locally over stdio, writes only inside the catalog folder, never deletes (trash only).
- **VS Code extension**, in `vscode-extension/`. A sidebar tree of the catalog, one click to open an item's files side by side, a **live preview panel** that refreshes on every save, and a command to save the open file as a catalog item.

Setup details: [`CAT-ALOG/CONNETTORI.md`](CAT-ALOG/CONNETTORI.md) (Italian).

## Quick start (Windows)

1. Install [Node.js](https://nodejs.org) (LTS).
2. Download or clone this repository and open the `CAT-ALOG` folder.
3. Double-click **`AVVIA.bat`** to run the app. The first run installs dependencies.
4. Optional: double-click **`CREA-INSTALLER.bat`** to build a regular installer (`dist\CAT-ALOG-Setup-….exe`).
5. Optional: run **`COLLEGA-CLAUDE-DESKTOP.bat`** (Claude connector) and **`COLLEGA-VSCODE.bat`** (VS Code extension).

Your data lives in `Documents\Catalogo MD` and is never touched by updates or reinstalls.

For development: `npm install`, `npm start`, `npm test`.

## Project layout

```
CAT-ALOG/
  main.js, preload.js     Electron main process and secure bridge
  lib/                    Pure logic (UMD): store, shared helpers, grid lab, responsive, SEO, icons…
  lib/libreria/           The starter library (components, structures, animations, interactions)
  renderer/               Interface: one script per tab
  mcp/                    Claude connector (Model Context Protocol server)
  vscode-extension/       VS Code extension
  test/                   146 automated tests (node:test + jsdom, real MCP over stdio)
  scripts/                Real-browser component audit, Electron smoke test
```

## Quality and security

- 146 automated tests; every library component is also audited in a real Chromium browser (errors, clicks, blank previews, overflow at 375 px).
- Electron hardening: context isolation, sandbox, no Node in the page, blocked navigation, no permissions granted, IPC accepted only from the app window.
- ZIP restore protected against path traversal and "zip bombs"; file names and paths validated.
- Known limits: the installer is unsigned (Windows SmartScreen shows a warning), and the main window has no Content-Security-Policy because previews execute the components' own JavaScript in isolated frames.

## Status

Personal project, actively developed. Developed with [Claude Code](https://claude.com/claude-code). All rights reserved; no open-source license has been chosen yet.

Full Italian documentation: [`CAT-ALOG/README.md`](CAT-ALOG/README.md), install guide [`CAT-ALOG/INSTALLA.md`](CAT-ALOG/INSTALLA.md), trial checklist [`CAT-ALOG/PROVA.md`](CAT-ALOG/PROVA.md).
