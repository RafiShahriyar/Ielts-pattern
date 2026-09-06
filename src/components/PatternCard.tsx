'use client';

import { useState } from 'react';
import type { Pattern } from '@/lib/types';
import { highlight } from '@/lib/highlight';

interface Props {
  item: Pattern;
  onEdit: (item: Pattern) => void;
  onDelete: (item: Pattern) => void;
}

export default function PatternCard({ item, onEdit, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyPattern() {
    try {
      await navigator.clipboard.writeText(item.pattern);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable — not worth interrupting the user over */
    }
  }

  return (
    <article className="card">
      <div className="card-head">
        <span className={item.category ? 'chip' : 'chip empty'}>
          {item.category || 'Uncategorised'}
        </span>

        <div className="card-actions">
          <button className="icon-btn" onClick={copyPattern} title="Copy the template">
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
        <div className="label">Pattern</div>
        <div className="pattern-text">{highlight(item.pattern, 'slot')}</div>
      </div>

      {item.example && (
        <div className="field">
          <div className="label">Example</div>
          <div className="example-text">{highlight(item.example, 'num')}</div>
        </div>
      )}

      {item.notes && (
        <div className="field">
          <div className="label">Notes</div>
          <div className="notes-text">{item.notes}</div>
        </div>
      )}
    </article>
  );
}
