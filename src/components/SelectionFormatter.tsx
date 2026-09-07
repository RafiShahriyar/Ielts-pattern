'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  HIGHLIGHT_COLORS,
  selectionOffsets,
  type FormatAction,
  type HighlightId,
} from '@/lib/richtext';

export type EntryField = 'example' | 'notes';

interface Props {
  /** Applies a format to a stored entry, for selections made on a card. */
  onFormatEntry: (
    id: number,
    field: EntryField,
    start: number,
    end: number,
    action: FormatAction
  ) => void;
}

interface Target {
  root: HTMLElement;
  /** `edit` is the live contenteditable; `view` is a card, which is not editable. */
  kind: 'edit' | 'view';
  entryId?: number;
  field?: EntryField;
}

const POPUP_HEIGHT = 38;

function findTarget(node: Node | null): Target | null {
  const el =
    node?.nodeType === Node.ELEMENT_NODE ? (node as Element) : (node?.parentElement ?? null);
  if (!el) return null;

  const edit = el.closest<HTMLElement>('[data-rich-edit]');
  if (edit) return { root: edit, kind: 'edit' };

  const view = el.closest<HTMLElement>('[data-rich-view]');
  if (view) {
    const id = Number(view.dataset.entry);
    const field = view.dataset.field as EntryField | undefined;
    if (Number.isFinite(id) && field) return { root: view, kind: 'view', entryId: id, field };
  }
  return null;
}

function enclosingMark(node: Node | null, boundary: HTMLElement): HTMLElement | null {
  let current: Node | null = node;
  while (current && current !== boundary) {
    if (current.nodeType === Node.ELEMENT_NODE && (current as Element).tagName === 'MARK') {
      return current as HTMLElement;
    }
    current = current.parentNode;
  }
  return null;
}

/**
 * A formatting bar that appears over whatever the user has just selected —
 * inside the editor, or straight on a card without opening the edit form.
 */
export default function SelectionFormatter({ onFormatEntry }: Props) {
  const [target, setTarget] = useState<Target | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setTarget(null);
      setPos(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const found = findTarget(range.commonAncestorContainer);
    if (!found || !range.toString().trim()) {
      setTarget(null);
      setPos(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) return;

    setTarget(found);
    setPos({
      top: Math.max(6, rect.top - POPUP_HEIGHT - 8),
      left: Math.min(Math.max(8, rect.left + rect.width / 2), window.innerWidth - 8),
    });
  }, []);

  useEffect(() => {
    // mouseup covers dragging a selection, keyup covers shift+arrow.
    const onUp = () => window.setTimeout(refresh, 0);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('keyup', onUp);
    // Any scroll moves the selection out from under the bar.
    const onScroll = () => {
      setTarget(null);
      setPos(null);
    };
    document.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('keyup', onUp);
      document.removeEventListener('scroll', onScroll, true);
    };
  }, [refresh]);

  function apply(action: FormatAction) {
    if (!target) return;

    if (target.kind === 'view' && target.entryId != null && target.field) {
      const offsets = selectionOffsets(target.root);
      if (offsets) onFormatEntry(target.entryId, target.field, offsets.start, offsets.end, action);
    } else {
      applyInEditor(target.root, action);
    }

    window.getSelection()?.removeAllRanges();
    setTarget(null);
    setPos(null);
  }

  function applyInEditor(root: HTMLElement, action: FormatAction) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    if (action.type === 'bold' || action.type === 'underline') {
      document.execCommand(action.type);
    } else if (action.type === 'clear') {
      const text = range.toString();
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
    } else {
      const existing = enclosingMark(range.commonAncestorContainer, root);
      if (existing && existing.textContent === range.toString()) {
        existing.className = action.color;
      } else {
        const mark = document.createElement('mark');
        mark.className = action.color;
        try {
          range.surroundContents(mark);
        } catch {
          mark.appendChild(range.extractContents());
          range.insertNode(mark);
        }
      }
    }

    root.normalize();
    // Let the editor's own onInput pick the change up.
    root.dispatchEvent(new Event('input', { bubbles: true }));
  }

  if (!target || !pos) return null;

  return (
    <div
      ref={popupRef}
      className="sel-bar"
      style={{ top: pos.top, left: pos.left }}
      // Keep the selection alive while the bar is clicked.
      onMouseDown={(e) => e.preventDefault()}
      role="toolbar"
      aria-label="Formatting"
    >
      <button className="sel-btn" onClick={() => apply({ type: 'bold' })} title="Bold">
        <strong>B</strong>
      </button>
      <button className="sel-btn" onClick={() => apply({ type: 'underline' })} title="Underline">
        <u>U</u>
      </button>

      <span className="sel-sep" />

      {HIGHLIGHT_COLORS.map((colour) => (
        <button
          key={colour.id}
          className={`sel-swatch ${colour.id}`}
          onClick={() => apply({ type: 'highlight', color: colour.id as HighlightId })}
          title={`Highlight ${colour.label.toLowerCase()}`}
          aria-label={`Highlight ${colour.label.toLowerCase()}`}
        />
      ))}

      <span className="sel-sep" />

      <button
        className="sel-btn"
        onClick={() => apply({ type: 'clear' })}
        title="Remove formatting"
        aria-label="Remove formatting"
      >
        ✕
      </button>
    </div>
  );
}
