'use client';

import { useEffect, useRef, useState } from 'react';
import RichTextEditor from '@/components/RichTextEditor';
import { richToText, sanitizeRich } from '@/lib/richtext';
import type { Pattern, PatternInput } from '@/lib/types';

interface Props {
  initial: Pattern | null;
  categories: string[];
  onSave: (input: PatternInput) => Promise<void>;
  onCancel: () => void;
}

/** Legacy rows have plain text only; show that as the editor's starting markup. */
function startingHtml(html: string, plain: string): string {
  if (html) return html;
  const escaped = document.createElement('div');
  escaped.textContent = plain;
  return escaped.innerHTML;
}

export default function PatternForm({ initial, categories, onSave, onCancel }: Props) {
  const [category, setCategory] = useState(initial?.category ?? '');
  const [exampleHtml, setExampleHtml] = useState('');
  const [notesHtml, setNotesHtml] = useState('');
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

    const example = richToText(exampleHtml);
    if (!example) {
      setError('An example sentence is required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSave({
        category,
        example,
        example_html: sanitizeRich(exampleHtml),
        notes: richToText(notesHtml),
        notes_html: sanitizeRich(notesHtml),
      });
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
        <h2>{initial ? 'Edit entry' : 'New entry'}</h2>

        {error && <div className="banner">{error}</div>}

        <div className="form-field">
          <label htmlFor="f-category">Name</label>
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
          <label>
            Example <span className="hint">— your corrected sentence</span>
          </label>
          <RichTextEditor
            ariaLabel="Example sentence"
            initialHtml={startingHtml(initial?.example_html ?? '', initial?.example ?? '')}
            onChange={setExampleHtml}
            placeholder="Regarding graduates' destinations, just over half (52%) secured…"
            minHeight={84}
          />
        </div>

        <div className="form-field">
          <label>Notes</label>
          <RichTextEditor
            ariaLabel="Notes"
            initialHtml={startingHtml(initial?.notes_html ?? '', initial?.notes ?? '')}
            onChange={setNotesHtml}
            placeholder="When to use it, what to watch out for…"
            minHeight={62}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Save changes' : 'Add entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
