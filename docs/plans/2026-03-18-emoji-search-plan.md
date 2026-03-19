# Emoji Search & Copy — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static site to search and copy emojis, using Vite + vite-plus and emojibase data.

**Architecture:** Two-panel layout with sidebar categories and main emoji grid. Vanilla TypeScript, no framework. Emoji data from emojibase-data bundled at build time. Search filters by annotation and tags. Click-to-copy with toast feedback.

**Tech Stack:** vite-plus, TypeScript, emojibase-data, emojibase-data messages, CSS custom properties.

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/style.css`

**Step 1: Create package.json**

```json
{
  "name": "emojis",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Step 2: Install dependencies**

Run: `npm install -D vite-plus @voidzero-dev/vite-plus-core@latest typescript`
Run: `npm install emojibase-data`

Then add overrides to package.json:
```json
"overrides": {
  "vite": "npm:@voidzero-dev/vite-plus-core@latest"
}
```

**Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

**Step 4: Create vite.config.ts**

```ts
import { defineConfig } from 'vite-plus';

export default defineConfig({
  build: {
    outDir: 'dist',
  },
});
```

**Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Emojis</title>
  <link rel="stylesheet" href="/src/style.css" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

**Step 6: Create src/style.css (empty placeholder)**

```css
/* styles will be added in Task 3 */
```

**Step 7: Create src/main.ts (smoke test)**

```ts
document.querySelector<HTMLDivElement>('#app')!.textContent = 'hello';
```

**Step 8: Verify dev server starts**

Run: `npx vite`
Expected: Dev server starts, page shows "hello"

**Step 9: Verify build works**

Run: `npx vite build`
Expected: Build succeeds, creates dist/ directory

**Step 10: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html src/
git commit -m "chore: scaffold vite-plus project with emojibase"
```

---

### Task 2: Emoji Data Layer

**Files:**
- Create: `src/data.ts`

**Step 1: Create src/data.ts**

This module imports emojibase data and messages, and exports functions the UI will consume.

```ts
import emojis from 'emojibase-data/en/compact.json';
import messages from 'emojibase-data/en/messages.json';

export interface Emoji {
  annotation: string;
  emoji: string;  // the compact format uses 'unicode' key — check and adapt
  hexcode: string;
  group: number;
  shortcodes?: string[];
  tags?: string[];
}

export interface Group {
  order: number;
  message: string;
  key: string;
}

// emojibase compact format uses `unicode` not `emoji` — normalize
export const allEmojis: Emoji[] = (emojis as any[]).map((e) => ({
  annotation: e.annotation,
  emoji: e.unicode ?? e.emoji,
  hexcode: e.hexcode,
  group: e.group,
  shortcodes: e.shortcodes,
  tags: e.tags,
}));

export const groups: Group[] = messages.groups;

export function getEmojisByGroup(group: number): Emoji[] {
  return allEmojis.filter((e) => e.group === group);
}

export function searchEmojis(query: string): Emoji[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return allEmojis.filter(
    (e) =>
      e.annotation.toLowerCase().includes(q) ||
      (e.tags && e.tags.some((t) => t.toLowerCase().includes(q))) ||
      (e.shortcodes && e.shortcodes.some((s) => s.toLowerCase().includes(q)))
  );
}
```

**Step 2: Verify data imports work**

Update src/main.ts temporarily:
```ts
import { allEmojis, groups } from './data';
console.log('Emojis loaded:', allEmojis.length);
console.log('Groups:', groups.map(g => g.message));
document.querySelector<HTMLDivElement>('#app')!.textContent =
  `Loaded ${allEmojis.length} emojis in ${groups.length} groups`;
```

Run: `npx vite` — open browser, check console
Expected: Shows emoji count (1800+) and group names

**Step 3: Commit**

```bash
git add src/data.ts src/main.ts
git commit -m "feat: add emoji data layer with search and group filtering"
```

---

### Task 3: HTML Structure & CSS

**Files:**
- Modify: `index.html`
- Modify: `src/style.css`

**Step 1: Update index.html with app structure**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Emojis</title>
  <link rel="stylesheet" href="/src/style.css" />
</head>
<body>
  <header class="search-bar">
    <input type="text" id="search" placeholder="Search emojis..." autocomplete="off" autofocus />
  </header>
  <div class="layout">
    <nav class="sidebar" id="sidebar"></nav>
    <main class="grid" id="grid"></main>
  </div>
  <div class="toast" id="toast">Copied!</div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

**Step 2: Write src/style.css**

```css
:root {
  --bg: #f8f6f2;
  --sidebar-bg: #efece6;
  --card-bg: #fff;
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  --card-hover-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --text: #3d3833;
  --text-muted: #8a8279;
  --accent: #b8860b;
  --radius: 8px;
  --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-bar {
  padding: 16px 24px;
  background: var(--bg);
  border-bottom: 1px solid #e2ded6;
  flex-shrink: 0;
}

.search-bar input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #d6d1c7;
  border-radius: var(--radius);
  font-size: 16px;
  font-family: var(--font);
  background: var(--card-bg);
  color: var(--text);
  outline: none;
}

.search-bar input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.15);
}

.layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background: var(--sidebar-bg);
  overflow-y: auto;
  flex-shrink: 0;
  padding: 8px 0;
  border-right: 1px solid #e2ded6;
}

.sidebar button {
  display: block;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  text-align: left;
  font-size: 13px;
  font-family: var(--font);
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}

.sidebar button:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--text);
}

.sidebar button.active {
  color: var(--text);
  font-weight: 600;
  background: rgba(184, 134, 11, 0.08);
}

.grid {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  gap: 8px;
  align-content: start;
}

.grid button {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  border: none;
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--card-shadow);
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
  padding: 0;
  line-height: 1;
}

.grid button:hover {
  transform: scale(1.15);
  box-shadow: var(--card-hover-shadow);
}

.grid button:active {
  transform: scale(0.95);
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: var(--text);
  color: var(--bg);
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-family: var(--font);
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  pointer-events: none;
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

@media (max-width: 600px) {
  .layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    padding: 4px 8px;
    border-right: none;
    border-bottom: 1px solid #e2ded6;
    display: flex;
    flex-shrink: 0;
  }

  .sidebar button {
    display: inline-block;
    width: auto;
    padding: 6px 12px;
    font-size: 12px;
    white-space: nowrap;
  }

  .grid {
    padding: 12px;
  }
}
```

**Step 3: Verify layout renders**

Run: `npx vite` — open browser
Expected: Search bar, sidebar area, grid area visible with correct layout

**Step 4: Commit**

```bash
git add index.html src/style.css
git commit -m "feat: add HTML structure and warm tactile CSS"
```

---

### Task 4: Main App Logic

**Files:**
- Modify: `src/main.ts`

**Step 1: Rewrite src/main.ts with full app logic**

```ts
import { allEmojis, groups, getEmojisByGroup, searchEmojis } from './data';
import type { Emoji } from './data';
import './style.css';

const sidebar = document.getElementById('sidebar')!;
const grid = document.getElementById('grid')!;
const searchInput = document.getElementById('search') as HTMLInputElement;
const toast = document.getElementById('toast')!;

let activeGroup = groups[0]?.order ?? 0;
let toastTimeout: ReturnType<typeof setTimeout> | null = null;

function renderSidebar(matchingGroups?: Set<number>) {
  sidebar.innerHTML = '';
  for (const group of groups) {
    const btn = document.createElement('button');
    btn.textContent = group.message;
    if (group.order === activeGroup) btn.classList.add('active');
    if (matchingGroups && !matchingGroups.has(group.order)) {
      btn.style.opacity = '0.4';
    }
    btn.addEventListener('click', () => {
      activeGroup = group.order;
      searchInput.value = '';
      render();
    });
    sidebar.appendChild(btn);
  }
}

function renderGrid(emojis: Emoji[]) {
  grid.innerHTML = '';
  for (const e of emojis) {
    const btn = document.createElement('button');
    btn.textContent = e.emoji;
    btn.title = e.annotation;
    btn.addEventListener('click', () => copyEmoji(e.emoji));
    grid.appendChild(btn);
  }
}

function copyEmoji(emoji: string) {
  navigator.clipboard.writeText(emoji);
  toast.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 1500);
}

function render() {
  const query = searchInput.value.trim();
  if (query) {
    const results = searchEmojis(query);
    const matchingGroups = new Set(results.map((e) => e.group));
    renderSidebar(matchingGroups);
    renderGrid(results);
  } else {
    renderSidebar();
    renderGrid(getEmojisByGroup(activeGroup));
  }
}

searchInput.addEventListener('input', render);

render();
```

**Step 2: Remove the CSS import from index.html since main.ts imports it**

Actually keep it in index.html for simplicity — Vite handles both. Remove the `import './style.css'` line from main.ts since it's already linked in index.html.

**Step 3: Verify full app works**

Run: `npx vite`
Expected:
- Sidebar shows all emoji categories
- Clicking a category shows emojis for that group
- Typing in search filters emojis across all groups
- Clicking an emoji copies it to clipboard and shows toast

**Step 4: Verify static build**

Run: `npx vite build && npx vite preview`
Expected: Same behavior from built static files

**Step 5: Commit**

```bash
git add src/main.ts
git commit -m "feat: wire up app with search, categories, and click-to-copy"
```

---

### Task 5: Polish & Final Verification

**Step 1: Test responsive layout**

Open browser dev tools, resize to mobile width (<600px).
Expected: Sidebar becomes horizontal scrollable bar above the grid.

**Step 2: Test search edge cases**

- Empty search → shows current category
- Search "cat" → shows cat-related emojis across groups
- Clear search → returns to category view

**Step 3: Final production build**

Run: `npx vite build`
Expected: dist/ directory with index.html, JS, and CSS assets.

**Step 4: Commit any remaining tweaks**

```bash
git add -A
git commit -m "chore: polish and verify static build"
```
