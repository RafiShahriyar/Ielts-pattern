import type { ThemeId } from './theme';

export interface Pattern {
  id: number;
  category: string;
  pattern: string;
  example: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type PatternInput = Pick<Pattern, 'category' | 'pattern' | 'example' | 'notes'>;

export interface PatternApi {
  /** Resolved in preload before first paint, so it is a value rather than a promise. */
  initialTheme: ThemeId;
  platform: string;
  list(opts?: { search?: string; category?: string }): Promise<Pattern[]>;
  create(input: PatternInput): Promise<Pattern>;
  update(id: number, input: PatternInput): Promise<Pattern>;
  remove(id: number): Promise<{ deleted: number }>;
  categories(): Promise<string[]>;
  getTheme(): Promise<ThemeId>;
  setTheme(theme: ThemeId): Promise<ThemeId>;
  dbPath(): Promise<string>;
  revealDb(): Promise<boolean>;
  window: {
    minimize(): void;
    toggleMaximize(): void;
    close(): void;
    onMaximized(cb: (isMaximized: boolean) => void): () => void;
  };
}

declare global {
  interface Window {
    api: PatternApi;
  }
}
