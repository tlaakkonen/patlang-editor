## Purpose

This file provides concise, repository-specific guidance for AI coding assistants so they can be productive immediately when editing this project.

## Quick repo snapshot
- Type: Single-page React app created with Vite.
- Entry: `index.html` → imports `/src/main.jsx`.
- UI: `src/main.jsx` mounts React and renders `App` from `src/App.jsx`.
- Scope: Pure frontend — no backend or external API code in this repository.

## What this app does

This is a small visual node/flow editor. The left sidebar is a palette (sections: wires, boxes). You can drag a "box" from the palette into the canvas to create a node. Nodes expose input/output handles; edges (wires) can be created between compatible handles only — connection logic enforces wire-type matching and colors edges using the wire's configured color.

## Key files to open first
- `package.json` — scripts (dev/build/preview/lint) and dependencies.
- `vite.config.js` — Vite config and plugins (currently uses `@vitejs/plugin-react`).
- `index.html` — HTML entry and script tag.
- `src/main.jsx` — app bootstrap (imports `index.css` and renders `<App />`).
- `src/App.jsx` — top-level React component (small placeholder UI today).
- `eslint.config.js` — lint rules and global ignores used by the project.

Additional important files
- `src/state/PaletteContext.jsx` — global palette state, sections, and helper `findItemByType` used by the canvas and sidebar.
- `src/components/Sidebar/PaletteSection.jsx` and `src/components/Sidebar/PaletteItem.jsx` — palette UI and drag-source behavior.
- `src/components/Canvas/CanvasPlaceholder.jsx` and `src/components/Canvas/CustomNode.jsx` — ReactFlow integration, node/edge lifecycle, drop handling (`onDrop`), and connection enforcement (`onConnect`, `onConnectStart`).

When you edit behavior for drag/drop, node defaults, or connection rules, these files are the primary places to change.

## How to run and verify quickly
1. Install dependencies:

	```bash
	npm install
	```

2. Start dev server:

	```bash
	npm run dev
	```

	Usually available at http://localhost:5173

3. Build for production:

	```bash
	npm run build
	```

4. Preview the built site:

	```bash
	npm run preview
	```
If you change dependencies, update `package.json` and re-run `npm install`.

## Conventions & patterns
- Components use `.jsx` files.
- CSS is imported from `src/main.jsx` (`import './index.css'`).
- ESM modules are used (`type: "module"` in `package.json`).
- ESLint configuration ignores `dist` and contains a custom `no-unused-vars` pattern that may ignore symbols starting with `^[A-Z_]`. Keep this in mind when renaming.

Libraries and dev notes
- The canvas uses `@xyflow/react` (a ReactFlow-like package). Its CSS is imported in `src/components/Canvas/CanvasPlaceholder.jsx` (`@xyflow/react/dist/style.css`) — keep that import when moving or refactoring the canvas.
- The sidebar uses Material UI (`@mui/material`) and icons (`@mui/icons-material`). If you add components that use MUI icons, ensure `@mui/icons-material` is installed (it was recently added).

UX & behavior highlights
- Drag from palette: `PaletteItem` sets `dataTransfer` with `application/x-node-type`; `CanvasPlaceholder.onDrop` reads this and creates a node using `screenToFlowPosition`.
- Connection rules: `CanvasPlaceholder.onConnect` looks up node types in the palette (`findItemByType`) and requires the output wire type to equal the input wire type. Successful edges are styled with the wire color.
- Connection preview color: `onConnectStart` sets `connectionLineStyle` so the preview matches the selected wire color.

## Editing guidance for AI assistants
- Make small, focused changes.
- Place new components under `src/` with `.jsx` extension and import them from `src/main.jsx` or other components.
- When adding scripts, tests, or CI, update `package.json` and include a short verification step in these instructions.

Manual test checklist (use after code changes)
1. Start dev server:

	```bash
	npm run dev
	```

2. Open the app (http://localhost:5173 by default).
3. In the left palette expand a section and drag a `Box` item into the canvas; verify a node appears where dropped.
4. Try connecting an output handle to an input handle with matching wire types — the connection should be created and colored per the wire definition.
5. Attempt a mismatched- wire connection — it should be rejected.
6. Collapse/expand palette sections and confirm UI behavior.

If any of these fail, check the console for errors and inspect `src/components/Canvas/CanvasPlaceholder.jsx` and `src/state/PaletteContext.jsx` for logic related to drops and connections.

Quick checklist for edits:
- [ ] Update or add files under `src/`.
- [ ] Run `npm run dev` and confirm the app loads.
- [ ] Run `npm run lint` and fix issues or explicitly explain why a rule is being bypassed.

## How I verify changes (suggested)
- For UI changes: run dev server and visually confirm the page.
- For builds: run `npm run build` and `npm run preview` to smoke-test the built output.
- For linting: run `npm run lint` and address errors/warnings.

## Notes / limitations
- There are currently no automated tests or CI configured in this repository. Do not assume a test framework exists.
- The app is minimal (a small placeholder UI). Large architectural changes should be discussed with the repo owner.

---
If you want this file tailored further (for example, stricter linting guidance, naming conventions, test instructions, or CI steps), tell me what to include and I will update it.
