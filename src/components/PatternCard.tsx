'use client';

import { useState } from 'react';
import type { Pattern } from '@/lib/types';
import { highlight } from '@/lib/highlight';
import { renderRich } from '@/lib/richtext';

interface Props {
  item: Pattern;
  onEdit: (item: Pattern) => void;
  onDelete: (item: Pattern) => void;
}

export default function PatternCard({ item, onEdit, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyExample() {
    try {
      await navigator.clipboard.writeText(item.example);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable — not worth interrupting the user over */
    }
  }

  // Rows written before formatting existed have plain text only.
  const example = item.example_html
    ? renderRich(item.example_html, 'num')
    : highlight(item.example, 'num');
  const notes = item.notes_html ? renderRich(item.notes_html) : item.notes;

  return (
    <article className="card">
      <div className="card-head">
        <span className={item.category ? 'chip' : 'chip empty'}>
          {item.category || 'Untitled'}
        </span>

        <div className="card-actions">
          <button className="icon-btn" onClick={copyExample} title="Copy the sentence">
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button className="icon-btn" onClick={() => onEdit(item)}>
            Edit
          </button>
          {confirming ? (
            <>
              <button className="icon-btn danger" onClick={() => onDelete(item)}>
                Really delete?
              </button>
              <button className="icon-btn" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button className="icon-btn danger" onClick={() => setConfirming(true)}>
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="field">
        <div className="label">Example</div>
        <div className="example-text">{example}</div>
      </div>

      {item.notes && (
        <div className="field">
          <div className="label">Notes</div>
          <div className="notes-text">{notes}</div>
        </div>
      )}
    </article>
  );
}
