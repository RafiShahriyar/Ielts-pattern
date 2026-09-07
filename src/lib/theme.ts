export type ThemeId =
  | 'system'
  | 'light'
  | 'dark'
  | 'crimson'
  | 'violet'
  | 'emerald'
  | 'gold';

export type ThemeGroup = 'system' | 'light' | 'dark';

export interface ThemeOption {
  id: ThemeId;
  label: string;
  hint: string;
  group: ThemeGroup;
  /** Swatch colours shown in settings: [background, surface, accent]. */
  swatch: [string, string, string];
}

export const THEME_GROUPS: { id: ThemeGroup; label: string }[] = [
  { id: 'system', label: 'Automatic' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export const THEMES: ThemeOption[] = [
  {
    id: 'system',
    label: 'System',
    hint: 'Follow the Windows light/dark setting',
    group: 'system',
    swatch: ['#f6f7f9', '#16181c', '#3d63dd'],
  },
  {
    id: 'light',
    label: 'Light',
    hint: 'Paper white with a blue accent',
    group: 'light',
    swatch: ['#f6f7f9', '#ffffff', '#3d63dd'],
  },
  {
    id: 'dark',
    label: 'Dark',
    hint: 'Muted charcoal, easy at night',
    group: 'dark',
    swatch: ['#16181c', '#1d2025', '#7d9bf5'],
  },
  {
    id: 'crimson',
    label: 'Black & Red',
    hint: 'Near-black with a crimson accent',
    group: 'dark',
    swatch: ['#0a0a0c', '#131317', '#e5484d'],
  },
  {
    id: 'violet',
    label: 'Black & Purple',
    hint: 'Near-black with a violet accent',
    group: 'dark',
    swatch: ['#0a0a0c', '#131317', '#a97bf5'],
  },
  {
    id: 'emerald',
    label: 'Black & Green',
    hint: 'Near-black with an emerald accent',
    group: 'dark',
    swatch: ['#0a0a0c', '#131317', '#3ecf8e'],
  },
  {
    id: 'gold',
    label: 'Black & Gold',
    hint: 'Near-black with a warm gold accent',
    group: 'dark',
    swatch: ['#0a0a0c', '#131317', '#e8b339'],
  },
];

const IDS = new Set<string>(THEMES.map((t) => t.id));

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && IDS.has(value);
}

export function themesInGroup(group: ThemeGroup): ThemeOption[] {
  return THEMES.filter((t) => t.group === group);
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
