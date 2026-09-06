<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# IELTS Pattern Bank

A personal quick-reference desktop app for IELTS Writing Task 1 sentence
patterns. Electron shell, Next.js renderer, local SQLite store.

`README.md` is the tour of what the app does. This file is the part that is easy
to get wrong.

## Getting it running

```bash
npm install
npm run dev      # Next dev server + Electron together
npm start        # production: next build, then Electron against the static export
npm run dist     # installer into release/
```

Versions are deliberately current: Electron 44, Next 16, React 19,
better-sqlite3 13. They are newer than most training data — check the real API
rather than assuming.

## Things that will bite you

**1. better-sqlite3 needs no rebuild.** v13 ships Node-API prebuilds
(`prebuilds/<platform>-<arch>.node`) that are ABI-stable across both Node and
Electron. Do **not** add `electron-rebuild` / `@electron/rebuild`. A native
rebuild in a `postinstall` hook is actively harmful: on a machine without a C++
toolchain it fails, and npm then rolls back the *entire* install, leaving an
empty `node_modules`. For packaging, `npmRebuild: false` and
`asarUnpack: ["**/node_modules/better-sqlite3/**"]` are already set in
`package.json`.

**2. The dev window must load `http://localhost:3000`, not `127.0.0.1`.** Next 16
treats them as different origins and blocks its own dev chunks across them. The
symptom is nasty: the page renders (it is the prerendered HTML) but never
hydrates, so it looks like an empty database rather than a broken bundle.
`allowedDevOrigins` in `next.config.mjs` and `DEV_URL` in `electron/main.js`
both depend on this.

**3. Production is a static export served over a custom `app://` protocol.**
`output: 'export'` writes absolute `/_next/...` paths that `file://` cannot
resolve, so `electron/main.js` registers an `app://` scheme and serves `out/`.
There is no Node server at runtime.

**4. The top bar is the window title bar.** `titleBarStyle: 'hidden'` removes the
OS one. Consequences:

- `.nav` is a drag region (`-webkit-app-region: drag`). Anything clickable
  inside it needs `-webkit-app-region: no-drag`, and text inputs also need
  `user-select: text` back.
- The window buttons are drawn by the app (`src/components/WindowControls.tsx`)
  and driven over IPC. macOS keeps its native traffic lights instead.
- `.nav-inner` is a `1fr auto 1fr` grid with **symmetric** padding so the tabs
  land on the window's midpoint. Padding one side to make room for something
  drags the centre column off centre — reserve space on the item instead.

**5. The page does not scroll; `.scroll` does.** `body` is a flex column with
`overflow: hidden`. This keeps the scrollbar below the nav so the nav spans the
full window width and the close button reaches the corner. Putting `overflow`
back on `body` undoes that.

**6. Pages fill the sidebar through a portal**, keyed on `SIDEBAR_ID` in
`src/lib/slots.ts`. This keeps filter state inside the page component instead of
lifting it into the shell. A page that renders nothing there leaves the rail
empty and `.sidebar:empty { display: none }` collapses it.

**7. Themes.** Four options; `system` is represented by the *absence* of
`data-theme` on `<html>`, so the `prefers-color-scheme` rules in `globals.css`
take over. The choice is stored in the database, read synchronously in preload,
and applied by an inline script in `src/app/layout.tsx` before first paint. All
colours are CSS custom properties defined once at the top of `globals.css` — a
new theme is one more `:root[data-theme='...']` block plus an entry in
`src/lib/theme.ts`.

## Conventions

- **All SQL lives in `electron/db.js`.** Nothing else touches the database.
- **The renderer has no direct access to anything.** Node integration is off and
  the renderer is sandboxed; it can only call the methods exposed on
  `window.api` in `electron/preload.js`, each of which round-trips to main.
  Main wraps every handler in an `{ok, data} | {ok, error}` envelope that
  preload unwraps, so the UI just awaits values.
- **Adding a capability** (quiz mode, import/export) means: a handler in
  `electron/main.js`, a method in `electron/preload.js`, and a signature on
  `PatternApi` in `src/lib/types.ts`.
- **Adding a page** is a component plus one entry in the `TABS` array in
  `src/components/NavBar.tsx`. Navigation is client-side view switching, not
  Next routes, so the static export stays a single `index.html`.
- Search is a case-insensitive `LIKE` across every field, with `%` and `_`
  escaped so they match literally.
- The three starter entries are seeded on first run only; the `meta` table
  records that, so deleting every entry does not bring them back. `meta` also
  holds the theme.

## Where the data lives

`<userData>/patterns.db` — on Windows `%APPDATA%/IELTS Pattern Bank/patterns.db`.
`app.setName()` is called before `whenReady`, without which unpackaged runs would
share the generic `Roaming/Electron` folder with every other dev Electron app.
