export interface BannerTheme {
  id: string;
  name: string;
  colors: readonly [string, string, string];
  primaryColor: string;
}

export const BANNER_THEMES: BannerTheme[] = [
  { id: 'indigo', name: 'Indigo', colors: ['#4b41e1', '#3d33d0', '#2b1fb8'], primaryColor: '#4b41e1' },
  { id: 'emerald', name: 'Emerald', colors: ['#00a472', '#008f63', '#00704d'], primaryColor: '#00a472' },
  { id: 'sunset', name: 'Sunset', colors: ['#f59e0b', '#ea580c', '#dc2626'], primaryColor: '#ea580c' },
  { id: 'ocean', name: 'Ocean', colors: ['#0284c7', '#2563eb', '#4f46e5'], primaryColor: '#2563eb' },
  { id: 'midnight', name: 'Obsidian', colors: ['#1e293b', '#0f172a', '#020617'], primaryColor: '#0f172a' },
  { id: 'amethyst', name: 'Amethyst', colors: ['#9333ea', '#7c3aed', '#4c1d95'], primaryColor: '#7c3aed' },
  { id: 'rose', name: 'Rose', colors: ['#f43f5e', '#e11d48', '#9f1239'], primaryColor: '#e11d48' },
  { id: 'aurora', name: 'Aurora', colors: ['#06b6d4', '#0d9488', '#115e59'], primaryColor: '#0d9488' },
  { id: 'unicorn', name: 'Unicorn', colors: ['#ec4899', '#8b5cf6', '#3b82f6'], primaryColor: '#ec4899' },
];

export const getBannerGradientColors = (themeId?: string): readonly [string, string, ...string[]] => {
  const found = BANNER_THEMES.find((t) => t.id === themeId);
  return found ? found.colors : ['#4b41e1', '#3d33d0', '#2b1fb8'];
};

export const getThemePrimaryColor = (themeId?: string): string => {
  const found = BANNER_THEMES.find((t) => t.id === themeId);
  return found ? found.primaryColor : '#4b41e1';
};
