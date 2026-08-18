export const BANNER_THEMES = [
  { id: 'indigo', name: 'Indigo', colors: ['#4b41e1', '#3d33d0', '#2b1fb8'] as const },
  { id: 'emerald', name: 'Emerald', colors: ['#00a472', '#008f63', '#00704d'] as const },
  { id: 'sunset', name: 'Sunset', colors: ['#f59e0b', '#ea580c', '#dc2626'] as const },
  { id: 'ocean', name: 'Ocean', colors: ['#0284c7', '#2563eb', '#4f46e5'] as const },
  { id: 'midnight', name: 'Obsidian', colors: ['#1e293b', '#0f172a', '#020617'] as const },
  { id: 'amethyst', name: 'Amethyst', colors: ['#9333ea', '#7c3aed', '#4c1d95'] as const },
  { id: 'rose', name: 'Rose', colors: ['#f43f5e', '#e11d48', '#9f1239'] as const },
  { id: 'aurora', name: 'Aurora', colors: ['#06b6d4', '#0d9488', '#115e59'] as const },
  { id: 'unicorn', name: 'Unicorn', colors: ['#ec4899', '#8b5cf6', '#3b82f6'] as const },
];

export const getBannerGradientColors = (themeId?: string): readonly [string, string, ...string[]] => {
  const found = BANNER_THEMES.find((t) => t.id === themeId);
  return found ? found.colors : ['#4b41e1', '#3d33d0', '#2b1fb8'];
};
