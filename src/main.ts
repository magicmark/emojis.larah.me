import { groups, getEmojisByGroup, searchEmojis, type Emoji } from './data';
import './style.css';

const sidebar = document.getElementById('sidebar')!;
const grid = document.getElementById('grid')!;
const searchInput = document.getElementById('search') as HTMLInputElement;
const toast = document.getElementById('toast')!;

let activeGroup: number = groups[0].order;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

// ---- Sidebar ----

function renderSidebar(dimmedGroups?: Set<number>) {
  sidebar.innerHTML = '';
  for (const g of groups) {
    const btn = document.createElement('button');
    btn.textContent = g.message;
    btn.dataset.group = String(g.order);

    if (g.order === activeGroup && !dimmedGroups) {
      btn.classList.add('active');
    }
    if (dimmedGroups && dimmedGroups.has(g.order)) {
      btn.classList.add('dimmed');
    }

    btn.addEventListener('click', () => {
      searchInput.value = '';
      activeGroup = g.order;
      renderSidebar();
      renderGrid();
    });

    sidebar.appendChild(btn);
  }
}

// ---- Grid ----

function renderGrid() {
  grid.innerHTML = '';
  const emojis = getEmojisByGroup(activeGroup);
  const container = createEmojiGrid(emojis);
  grid.appendChild(container);
  grid.scrollTop = 0;
}

function renderSearchResults(query: string) {
  const results = searchEmojis(query);

  // Figure out which groups have matches
  const matchedGroups = new Set<number>();
  for (const e of results) {
    matchedGroups.add(e.group);
  }

  // Dim sidebar categories with no matches
  const dimmed = new Set<number>();
  for (const g of groups) {
    if (!matchedGroups.has(g.order)) {
      dimmed.add(g.order);
    }
  }
  renderSidebar(dimmed);

  // Render results grouped by category
  grid.innerHTML = '';

  if (results.length === 0) {
    const msg = document.createElement('p');
    msg.textContent = 'No emojis found.';
    msg.style.color = 'var(--text-muted)';
    msg.style.padding = '24px 4px';
    msg.style.fontSize = '14px';
    grid.appendChild(msg);
    return;
  }

  // Group results by their group number, preserving group order
  const byGroup = new Map<number, Emoji[]>();
  for (const e of results) {
    if (!byGroup.has(e.group)) {
      byGroup.set(e.group, []);
    }
    byGroup.get(e.group)!.push(e);
  }

  for (const g of groups) {
    const emojis = byGroup.get(g.order);
    if (!emojis) continue;

    const title = document.createElement('div');
    title.className = 'grid-section-title';
    title.textContent = g.message;
    grid.appendChild(title);

    const container = createEmojiGrid(emojis);
    grid.appendChild(container);
  }

  grid.scrollTop = 0;
}

function createEmojiGrid(emojis: Emoji[]): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'emoji-grid';

  for (const e of emojis) {
    const btn = document.createElement('button');
    btn.textContent = e.emoji;
    btn.title = e.annotation;
    btn.addEventListener('click', () => copyEmoji(e.emoji));
    container.appendChild(btn);
  }

  return container;
}

// ---- Copy + Toast ----

function copyEmoji(emoji: string) {
  navigator.clipboard.writeText(emoji).then(() => {
    showToast();
  });
}

function showToast() {
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toast.classList.add('show');
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    toastTimer = null;
  }, 1500);
}

// ---- Search ----

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  if (query) {
    renderSearchResults(query);
  } else {
    renderSidebar();
    renderGrid();
  }
});

// ---- Init ----

renderSidebar();
renderGrid();
