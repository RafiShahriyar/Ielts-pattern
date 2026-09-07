import type { ThemeId } from './theme';

export interface Pattern {
  id: number;
  category: string;
  /** Plain text — what search matches against. */
  example: string;
  /** The same sentence with bold/underline/highlight markup, if any. */
  example_html: string;
  notes: string;
  notes_html: string;
  created_at: string;
  updated_at: string;
}

export type PatternInput = Pick<
  Pattern,
  'category' | 'example' | 'example_html' | 'notes' | 'notes_html'
>;

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
