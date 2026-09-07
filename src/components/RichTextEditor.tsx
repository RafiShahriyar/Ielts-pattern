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
  autoFocus?: boolean;
}

/**
 * A plain contenteditable field. Formatting comes from the selection bar that
 * appears over whatever you highlight, so there is no toolbar of its own;
 * Ctrl+B and Ctrl+U work natively.
 */
export default function RichTextEditor({
  initialHtml,
  onChange,
  placeholder,
  minHeight = 76,
  ariaLabel,
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

  return (
    <div
      ref={ref}
      className="editor-area"
      data-rich-edit=""
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      aria-label={ariaLabel}
      data-placeholder={placeholder}
      style={{ minHeight }}
      onInput={() => {
        if (ref.current) onChange(ref.current.innerHTML);
      }}
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
  );
}
