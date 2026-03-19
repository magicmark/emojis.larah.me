# Emoji Search & Copy — Design

## Layout

Two-panel layout. Left sidebar lists emoji categories (Smileys & Emotion, People & Body, Animals & Nature, etc.). Main area shows a dense grid of emojis for the selected category. Sticky search bar at the top spans full width.

## Search

Typing in the search bar filters across all categories by emoji name and keywords (from emojibase). Results show in the main area as a flat grid. Sidebar highlights which categories have matches.

## Interaction

Click any emoji → copies to clipboard → brief "Copied!" toast appears (bottom-center, fades after 1.5s). No detail panels, no hover states beyond a subtle scale/highlight to indicate clickability.

## Visual Style

Warm and tactile. Soft off-white or light warm gray background. Sidebar has a slightly darker tone. Emoji grid items have light rounded cards with subtle box-shadow. Clean sans-serif font (system font stack). No gradients, no decorative elements. Comfortable spacing.

## Tech Stack

- Vite + vite-plus for toolchain
- Vanilla TypeScript — no framework
- emojibase for emoji data, bundled at build time
- Static site output via `vite build`
- CSS with custom properties for the warm palette

## Responsive

On narrow screens, sidebar collapses into a horizontal scrollable category bar above the grid.
