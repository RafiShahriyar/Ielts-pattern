# IELTS Pattern Bank

A small desktop app for storing the sentence patterns I reuse in IELTS Writing
Task 1 — each one a reusable template plus a corrected example sentence.

Electron shell + Next.js renderer, with entries stored in a local SQLite file.

## Running it

```bash
npm install
npm run dev      # Next dev server + Electron, with hot reload
```

To run the production build locally:

```bash
npm start        # next build, then Electron against the static export
```

To produce an installer:

```bash
npm run dist     # output lands in release/
```

## Window chrome

There is no OS title bar. `titleBarStyle: 'hidden'` drops it and the app's own
nav strip runs to the top edge of the window, acting as the drag handle. The
minimise / maximise / close buttons are drawn by the app itself
(`src/components/WindowControls.tsx`) at the right-hand end of that strip, using
the theme's own background and text tokens, so they blend into the bar rather
than sitting in a separate title bar.

They are wired to the window through `window.api.window.*`, and main pushes the
maximise state back on the `window:maximized` channel so the middle button can
switch between the maximise and restore icons.

Three things that follow from this, worth knowing before editing the nav:

- The strip is a drag region (`-webkit-app-region: drag`). Anything clickable
  inside it needs `-webkit-app-region: no-drag`, or it stops responding — and
  text inputs need `user-select: text` back, since the strip disables it.
- The bar is a `1fr auto 1fr` grid with **symmetric** padding so the tabs sit on
  the window's midpoint. Padding one side to clear the window buttons shifts the
  centre column off it; reserve that space on the item instead.
- The page does not scroll; `.scroll` does. That keeps the scrollbar below the
  nav so the nav spans the full window width and the close button reaches the
  corner. Putting `overflow` back on `body` undoes that.
- macOS keeps its native traffic lights instead (`WindowControls` renders
  nothing there), positioned to line up with the same strip.

Electron's built-in Window Controls Overlay (`titleBarOverlay`) is the other way
to do this and would bring Windows 11 Snap Layouts with it, at the cost of
styling control. It was not used here.

## Pages

The stock File/Edit/View menu bar is removed; the app navigates through its own
top bar instead.

- **Patterns** — the searchable bank. Each entry is a **name**, an **example**
  sentence and **notes**. Add, edit and delete entries, filter by name, copy a
  sentence to the clipboard. Search and the name list live in the left sidebar.
  Example and notes take **bold**, underline and highlight.
- **Writing** — a read-only reference of IELTS Writing question types: Task 1
  Academic (bar chart, line graph, pie chart, table, process, map, mixed),
  Task 2 essay types, General Training letters, and paragraph structures. The
  section list is in the sidebar; the content lives in `src/lib/writing-data.ts`.
- **Vocab** — a reference of linking words (contrast, concession, cause, result,
  addition, sequence, examples, similarity, emphasis, summary) and Task 1
  language (trend verbs, degree adverbs, proportions). Each entry carries the
  grammar note that actually costs marks — what `despite` may be followed by,
  why a comma before `however` is a splice — plus an example. Searchable from
  the sidebar; content lives in `src/lib/vocab-data.ts`.

## Layout

Under the top bar the window is a sidebar rail plus a scrolling content column.
Pages fill the sidebar through a portal keyed on `SIDEBAR_ID`
(`src/lib/slots.ts`), which keeps filter state inside the page component rather
than lifting it into the shell. A page that puts nothing there — Settings —
leaves the rail empty, and `.sidebar:empty { display: none }` collapses it so the
content takes the full width. That does mean the content shifts left when you
open Settings.

`.app` is capped at 1080px rather than stretched edge to edge, so example
sentences keep a readable line length.

## Themes

Seven, grouped in Settings as Automatic / Light / Dark:

- **Automatic** — System, follows the Windows light/dark setting
- **Light** — Light
- **Dark** — Dark, Black & Red, Black & Purple, Black & Green, Black & Gold

The choice is saved in the database and applied before the first frame is
painted, so there is no flash on launch. Colours are defined once as CSS custom
properties at the top of `src/app/globals.css`. Adding a theme is three edits:
a `:root[data-theme='...']` block there, an entry in `THEMES` in
`src/lib/theme.ts` (with its `group`), and its background in `THEME_BG` in
`electron/main.js` so the native window frame matches.

## Where the data lives

A SQLite database at `<userData>/patterns.db` — on Windows that is
`%APPDATA%/IELTS Pattern Bank/patterns.db`. The **Show database file** button on
the Settings page opens the folder.

The three starter entries are inserted the first time the database is created.
Seeding is recorded in a `meta` table, so deleting every entry will not bring
them back on the next launch. That same table holds the theme setting.

## How it fits together

| Path                       | Role                                                    |
| -------------------------- | ------------------------------------------------------- |
| `electron/main.js`         | Window, menu, custom `app://` protocol, IPC handlers     |
| `electron/db.js`           | All SQL — schema, seeding, queries, settings             |
| `electron/preload.js`      | Bridges `window.api` into the renderer over `contextBridge` |
| `src/app/page.tsx`         | Shell: nav bar, page switching, theme state              |
| `src/app/layout.tsx`       | Theme bootstrap script that runs before first paint      |
| `src/components/NavBar.tsx`| The top navigation, which doubles as the title bar        |
| `src/components/WindowControls.tsx` | Minimise / maximise / close buttons             |
| `src/components/PatternsView.tsx` | Search, filter, list and the add/edit flow        |
| `src/components/WritingView.tsx`  | Question-type reference                           |
| `src/components/SettingsView.tsx` | Themes, storage, shortcuts                        |
| `src/lib/highlight.tsx`    | Marks numbers/percentages in examples and `[slots]` in templates |
| `src/lib/richtext.tsx`     | Sanitises editor output and renders stored markup        |
| `src/components/RichTextEditor.tsx` | Contenteditable field used by the edit form    |
| `src/components/SelectionFormatter.tsx` | The bar that appears over a selection      |
| `src/lib/theme.ts`         | Theme list and the `data-theme` switch                   |
| `src/lib/slots.ts`         | DOM id for the sidebar portal target                     |
| `src/lib/scroll.ts`        | Jump-to-card scrolling, shared by Writing and Vocab       |
| `src/components/VocabView.tsx` | Linking words and Task 1 vocabulary                  |

The renderer has no database access of its own: it can only call the methods
exposed in `preload.js`, each of which round-trips to `electron/db.js`. Node
integration is off and the renderer is sandboxed.

## Formatting

Select any text and a small bar appears over it with **bold**, underline, four
highlight colours (yellow, green, blue, pink) and remove-formatting. It works in
two places:

- inside the edit form, and
- **straight on a card**, without opening the edit form at all — the change is
  saved as soon as you pick a format.

Cards are not `contenteditable`. A selection on a card is converted to plain
character offsets, the format is applied to the stored markup at those offsets,
and the entry is saved. That keeps stray keystrokes from ever editing an entry
by accident.

Each field is stored twice: the plain text in `example` / `notes`, and the
marked-up version in `example_html` / `notes_html`. Search runs against the plain
text, so markup never turns up in results, and a row written before formatting
existed still renders from its plain text.

Each highlight sets both a solid background and its own dark text colour, so it
reads like a highlighter pen and its contrast is fixed rather than depending on
the active theme — measured at 9.3:1 to 12.4:1, identical across all seven. A
translucent tint was tried first and was the wrong call: over a near-black card
it composites to a muddy mid-tone and dulls the words instead of lifting them.
A figure inside a highlight drops its own background so the two do not fight.

Search is a case-insensitive `LIKE` across name, example and notes, with `%` and
`_` escaped so they match literally.

Navigation is client-side view switching rather than separate Next routes, so
moving between pages is instant and keeps the single static `index.html` that
the `app://` protocol serves.

## Shortcuts

- `Ctrl+K` — focus search (Patterns and Vocab pages)
- `Ctrl+N` — new pattern
- `Ctrl+Enter` — save the open form
- `Esc` — close the form

In development only, `F12` toggles devtools and `Ctrl+R` reloads — the menu that
normally provides these is removed.

## Notes for later

Adding a quiz mode or import/export means adding handlers in `electron/main.js`
and matching methods in `electron/preload.js`; the renderer picks them up through
the `PatternApi` interface in `src/lib/types.ts`. A new page is a component plus
one entry in the `TABS` array in `src/components/NavBar.tsx`.
