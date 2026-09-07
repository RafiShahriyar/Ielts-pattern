'use client';

import { useEffect, useRef } from 'react';
import { sanitizeRich } from '@/lib/richtext';

interface Props {
  /** Initial markup. Read once on mount — the caret would jump if it were synced. */
  initialHtml: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  ariaLabel: string;
  mono?: boolean;
  autoFocus?: boolean;
}

export default function RichTextEditor({
  initialHtml,
  onChange,
  placeholder,
  minHeight = 76,
  ariaLabel,
  mono = false,
  autoFocus = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = initialHtml;
    // Produce <b>/<u> rather than styled spans, so the markup stays themeable.
    try {
      document.execCommand('styleWithCSS', false, 'false');
    } catch {
      /* not supported everywhere; the sanitiser copes either way */
    }
    if (autoFocus) el.focus();
    // Mount only: this component owns its DOM from here on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emit() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function exec(command: string) {
    ref.current?.focus();
    document.execCommand(command);
    emit();
  }

  /** Wraps or unwraps the selection in <mark>, so it follows the theme. */
  function toggleHighlight() {
    const el = ref.current;
    if (!el) return;
    el.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) return;

    const existing = enclosingMark(range.commonAncestorContainer, el);
    if (existing) {
      const parent = existing.parentNode;
      if (parent) {
        while (existing.firstChild) parent.insertBefore(existing.firstChild, existing);
        parent.removeChild(existing);
        parent.normalize();
      }
    } else {
      const mark = document.createElement('mark');
      mark.className = 'hl';
      try {
        range.surroundContents(mark);
      } catch {
        // The selection crossed an element boundary; move the contents instead.
        mark.appendChild(range.extractContents());
        range.insertNode(mark);
      }
    }

    selection.removeAllRanges();
    emit();
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

  function onKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      toggleHighlight();
    }
  }

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <button
          type="button"
          className="fmt-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('bold')}
          title="Bold (Ctrl+B)"
          aria-label="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="fmt-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('underline')}
          title="Underline (Ctrl+U)"
          aria-label="Underline"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          className="fmt-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleHighlight}
          title="Highlight (Ctrl+Shift+H)"
          aria-label="Highlight"
        >
          <mark className="hl">H</mark>
        </button>
      </div>

      <div
        ref={ref}
        className={mono ? 'editor-area mono' : 'editor-area'}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel}
        data-placeholder={placeholder}
        style={{ minHeight }}
        onInput={emit}
        onKeyDown={onKeyDown}
        onBlur={() => {
          // Tidy the markup once the field is left, rather than on every keystroke.
          if (!ref.current) return;
          const clean = sanitizeRich(ref.current.innerHTML);
          if (clean !== ref.current.innerHTML) {
            ref.current.innerHTML = clean;
            onChange(clean);
          }
        }}
      />
    </div>
  );
}
