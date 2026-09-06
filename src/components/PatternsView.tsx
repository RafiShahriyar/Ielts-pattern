'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PatternCard from '@/components/PatternCard';
import PatternForm from '@/components/PatternForm';
import type { Pattern, PatternInput } from '@/lib/types';
import { SIDEBAR_ID } from '@/lib/slots';

export default function PatternsView() {
  const [items, setItems] = useState<Pattern[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [editor, setEditor] = useState<{ item: Pattern | null } | null>(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [sideSlot, setSideSlot] = useState<HTMLElement | null>(null);

  // The search box and category list live in the shell's left sidebar;
  // portalling keeps their state here rather than lifting it into the shell.
  useEffect(() => {
    setSideSlot(document.getElementById(SIDEBAR_ID));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 150);
    return () => clearTimeout(t);
  }, [search]);

  const reload = useCallback(async () => {
    if (typeof window === 'undefined' || !window.api) return;
    try {
      const [rows, cats] = await Promise.all([
        window.api.list({ search: debouncedSearch, category }),
        window.api.categories(),
      ]);
      setItems(rows);
      setCategories(cats);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setReady(true);
    }
  }, [debouncedSearch, category]);

  useEffect(() => {
    // The bridge only exists inside Electron; `next dev` in a plain browser has no database.
    if (!window.api) {
      setError('No database connection — run this window through Electron (npm run dev).');
      setReady(true);
      return;
    }
    void reload();
  }, [reload]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (mod && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditor({ item: null });
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  async function save(input: PatternInput) {
    if (!window.api) throw new Error('No database connection.');
    if (editor?.item) await window.api.update(editor.item.id, input);
    else await window.api.create(input);
    setEditor(null);
    await reload();
  }

  async function remove(item: Pattern) {
    try {
      await window.api.remove(item.id);
      // Drop the filter if that was the last entry in the category.
      const cats = await window.api.categories();
      if (category && !cats.includes(category)) setCategory('');
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const filtering = Boolean(debouncedSearch || category);

  return (
    <>
      {sideSlot &&
        createPortal(
          <>
            <div className="side-block">
              <div className="search">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…  Ctrl+K"
                  spellCheck={false}
                />
                {search && (
                  <button className="clear" onClick={() => setSearch('')} title="Clear search">
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="side-block">
              <div className="side-label">Categories</div>
              <nav className="side-list">
                <button
                  className={category ? 'side-item' : 'side-item active'}
                  onClick={() => setCategory('')}
                >
                  All categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    className={category === c ? 'side-item active' : 'side-item'}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </nav>
            </div>
          </>,
          sideSlot
        )}

      <div className="page-head">
        <div className="titlerow">
          <h1>Patterns</h1>
          <span className="count">
            {items.length} {items.length === 1 ? 'pattern' : 'patterns'}
            {filtering ? ' shown' : ''}
          </span>
          <button className="btn btn-primary head-action" onClick={() => setEditor({ item: null })}>
            New
          </button>
        </div>
      </div>

      {error && <div className="banner">{error}</div>}

      {ready && items.length === 0 ? (
        <div className="empty-state">
          {filtering ? (
            <p>Nothing matches that search.</p>
          ) : (
            <>
              <p>No patterns yet.</p>
              <p>Add the first structure you want to reuse.</p>
            </>
          )}
        </div>
      ) : (
        <div className="list">
          {items.map((item) => (
            <PatternCard
              key={item.id}
              item={item}
              onEdit={(it) => setEditor({ item: it })}
              onDelete={remove}
            />
          ))}
        </div>
      )}

      <div className="footer">
        <span>Ctrl+K search · Ctrl+N new · Ctrl+Enter save · Esc close</span>
      </div>

      {editor && (
        <PatternForm
          initial={editor.item}
          categories={categories}
          onSave={save}
          onCancel={() => setEditor(null)}
        />
      )}
    </>
  );
}
