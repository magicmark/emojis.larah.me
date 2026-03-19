// Emojibase compact data + messages + shortcodes
import compactData from 'emojibase-data/en/compact.json';
import messages from 'emojibase-data/en/messages.json';
import shortcodes from 'emojibase-data/en/shortcodes/emojibase.json';

export interface Emoji {
  annotation: string;
  emoji: string;
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

// Shortcodes map is keyed by hexcode -> string | string[]
const shortcodesMap = shortcodes as Record<string, string | string[]>;

function resolveShortcodes(hexcode: string): string[] | undefined {
  const val = shortcodesMap[hexcode];
  if (!val) return undefined;
  return Array.isArray(val) ? val : [val];
}

// Normalize compact format:
//  - compact uses `unicode` (not `emoji`) and `label` (not `annotation`)
//  - shortcodes are stored separately and must be merged
//  - filter out emojis without a group (e.g. regional indicators, components)
// Detect whether the browser can render a given emoji (not tofu)
function canRenderEmoji(emoji: string): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 20;
  canvas.height = 20;
  const ctx = canvas.getContext('2d')!;
  ctx.font = '16px serif';
  ctx.fillText(emoji, 0, 16);

  // Draw a character we know won't render — U+FFFF
  const blank = document.createElement('canvas');
  blank.width = 20;
  blank.height = 20;
  const bctx = blank.getContext('2d')!;
  bctx.font = '16px serif';
  bctx.fillText('\uFFFF', 0, 16);

  return canvas.toDataURL() !== blank.toDataURL();
}

export const allEmojis: Emoji[] = (compactData as any[])
  .filter((e) => typeof e.group === 'number')
  .map((e) => ({
    annotation: e.label,
    emoji: e.unicode,
    hexcode: e.hexcode,
    group: e.group,
    shortcodes: resolveShortcodes(e.hexcode) ?? e.shortcodes,
    tags: e.tags,
  }))
  .filter((e) => canRenderEmoji(e.emoji));

// Extract groups from messages dataset
export const groups: Group[] = messages.groups.map((g) => ({
  order: g.order,
  message: g.message,
  key: g.key,
}));

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
