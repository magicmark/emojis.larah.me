import { allEmojis, groups } from './data';
console.log('Emojis loaded:', allEmojis.length);
console.log('Groups:', groups.map(g => g.message));
document.querySelector<HTMLDivElement>('#app')!.textContent =
  `Loaded ${allEmojis.length} emojis in ${groups.length} groups`;
