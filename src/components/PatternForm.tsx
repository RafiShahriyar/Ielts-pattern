'use client';

import { useEffect, useRef, useState } from 'react';
import type { Pattern, PatternInput } from '@/lib/types';

interface Props {
  initial: Pattern | null;
  categories: string[];
  onSave: (input: PatternInput) => Promise<void>;
  onCancel: () => void;
}

export default function PatternForm({ initial, categories, onSave, onCancel }: Props) {
  const [category, setCategory] = useState(initial?.category ?? '');
  const [pattern, setPattern] = useState(initial?.pattern ?? '');
  const [example, setExample] = useState(initial?.example ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstField.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (saving) return;

    if (!pattern.trim()) {
      setError('A sentence pattern is required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSave({ category, pattern, example, notes });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <form
        className="modal"
        onSubmit={submit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
        }}
      >
        <h2>{initial ? 'Edit pattern' : 'New pattern'}</h2>

        {error && <div className="banner">{error}</div>}

        <div className="form-field">
          <label htmlFor="f-category">Category</label>
          <input
            id="f-category"
            ref={firstField}
            list="category-options"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Overview / Leading figure"
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="form-field">
          <label htmlFor="f-pattern">
            Sentence pattern <span className="hint">— use [brackets] for the slots you swap out</span>
          </label>
          <textarea
            id="f-pattern"
            className="mono"
            rows={3}
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Regarding [topic], just over half ([X]%) [verb], making it by far the largest category."
          />
        </div>

        <div className="form-field">
          <label htmlFor="f-example">
            Example <span className="hint">— your corrected sentence</span>
          </label>
          <textarea
            id="f-example"
            rows={3}
            value={example}
            onChange={(e) => setExample(e.target.value)}
            placeholder="Regarding graduates' destinations, just over half (52%) secured full-time employment…"
          />
        </div>

        <div className="form-field">
          <label htmlFor="f-notes">Notes</label>
          <textarea
            id="f-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="When to use it, what to watch out for…"
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Save changes' : 'Add pattern'}
          </button>
        </div>
      </form>
    </div>
  );
}
