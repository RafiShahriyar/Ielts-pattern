export type ThemeId = 'system' | 'light' | 'dark' | 'crimson';

export interface ThemeOption {
  id: ThemeId;
  label: string;
  hint: string;
  /** Swatch colours shown in settings: [background, surface, accent]. */
  swatch: [string, string, string];
}

export const THEMES: ThemeOption[] = [
  {
    id: 'system',
    label: 'System',
    hint: 'Follow the Windows light/dark setting',
    swatch: ['#f6f7f9', '#16181c', '#3d63dd'],
  },
  {
    id: 'light',
    label: 'Light',
    hint: 'Paper white with a blue accent',
    swatch: ['#f6f7f9', '#ffffff', '#3d63dd'],
  },
  {
    id: 'dark',
    label: 'Dark',
    hint: 'Muted charcoal, easy at night',
    swatch: ['#16181c', '#1d2025', '#7d9bf5'],
  },
  {
    id: 'crimson',
    label: 'Black & Red',
    hint: 'Near-black with a crimson accent',
    swatch: ['#0a0a0c', '#131317', '#e5484d'],
  },
];

const IDS = new Set<string>(THEMES.map((t) => t.id));

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && IDS.has(value);
}

/**
 * `system` is represented by the absence of the attribute, so the
 * prefers-color-scheme rules in globals.css can take over.
 */
export function applyTheme(theme: ThemeId): void {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}
