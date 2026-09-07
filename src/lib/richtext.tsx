import { createElement, Fragment, type ReactNode } from 'react';
import { highlight } from './highlight';

export const HIGHLIGHT_COLORS = [
  { id: 'hl-yellow', label: 'Yellow' },
  { id: 'hl-green', label: 'Green' },
  { id: 'hl-blue', label: 'Blue' },
  { id: 'hl-pink', label: 'Pink' },
] as const;

export type HighlightId = (typeof HIGHLIGHT_COLORS)[number]['id'];

/** `hl` is the original accent-tinted highlight, kept for entries written before colours. */
const HL_CLASSES = new Set<string>(['hl', ...HIGHLIGHT_COLORS.map((c) => c.id)]);

export type FormatAction =
  | { type: 'bold' }
  | { type: 'underline' }
  | { type: 'highlight'; color: HighlightId }
  | { type: 'clear' };

/**
 * The only markup an entry may carry. Everything else is unwrapped, so stored
 * content can never introduce elements or attributes of its own — the render
 * path builds elements from this map rather than injecting HTML.
 */
const ALLOWED: Record<string, string> = {
  B: 'strong',
  STRONG: 'strong',
  I: 'em',
  EM: 'em',
  U: 'u',
  MARK: 'mark',
  BR: 'br',
};

/** execCommand's highlight produces a styled span; treat that as a mark. */
function isHighlightSpan(el: Element): boolean {
  return el.tagName === 'SPAN' && Boolean((el as HTMLElement).style?.backgroundColor);
}

function tagFor(el: Element): string | null {
  return ALLOWED[el.tagName] ?? (isHighlightSpan(el) ? 'mark' : null);
}

/** Keeps a mark's colour class if it is one we know, otherwise the default. */
function markClass(el: Element): string {
  const found = Array.from(el.classList ?? []).find((c) => HL_CLASSES.has(c));
  return found ?? 'hl';
}

function parse(html: string): HTMLElement | null {
  if (typeof DOMParser === 'undefined') return null;
  return new DOMParser().parseFromString(html, 'text/html').body;
}

/** Wraps plain text as markup, for entries written before formatting existed. */
export function textToHtml(plain: string): string {
  if (typeof document === 'undefined') return plain;
  const div = document.createElement('div');
  div.textContent = plain;
  return div.innerHTML;
}

/** Strips an editor's output down to the allowlist, dropping all attributes. */
export function sanitizeRich(html: string): string {
  const body = parse(html);
  if (!body) return html;

  const out = document.createElement('div');
  copyClean(body, out);
  return out.innerHTML;
}

function copyClean(src: Node, dest: Node): void {
  src.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      dest.appendChild(document.createTextNode(node.nodeValue ?? ''));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as Element;
    const tag = tagFor(el);

    // Not on the allowlist: keep the words, drop the wrapper.
    if (!tag) {
      copyClean(el, dest);
      return;
    }

    // Removing a format leaves its now-empty element behind; drop those rather
    // than keeping a wrapper with nothing in it.
    if (tag !== 'br' && !(el.textContent ?? '').length && !el.querySelector?.('br')) {
      return;
    }

    const clean = document.createElement(tag);
    if (tag === 'mark') clean.className = markClass(el);
    dest.appendChild(clean);
    if (tag !== 'br') copyClean(el, clean);
  });
}

/** Plain text of some markup, for search and for the clipboard. */
export function richToText(html: string): string {
  const body = parse(html);
  return (body?.textContent ?? html).replace(/\s+/g, ' ').trim();
}

/**
 * Renders stored markup as React elements. `kind` additionally marks numbers or
 * template slots inside the text, so automatic and manual highlighting coexist.
 */
export function renderRich(html: string, kind: 'num' | 'slot' | null = null): ReactNode {
  const body = parse(html);
  if (!body) return html;
  return toReact(body.childNodes, kind);
}

function toReact(nodes: NodeListOf<ChildNode>, kind: 'num' | 'slot' | null): ReactNode[] {
  const out: ReactNode[] = [];

  nodes.forEach((node, i) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue ?? '';
      out.push(kind ? <Fragment key={i}>{highlight(text, kind)}</Fragment> : text);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as Element;
    const tag = tagFor(el);

    if (!tag) {
      out.push(<Fragment key={i}>{toReact(el.childNodes, kind)}</Fragment>);
      return;
    }
    if (tag === 'br') {
      out.push(<br key={i} />);
      return;
    }

    out.push(
      createElement(
        tag,
        { key: i, ...(tag === 'mark' ? { className: markClass(el) } : {}) },
        toReact(el.childNodes, kind)
      )
    );
  });

  return out;
}

/* ---------- selection <-> stored markup ---------- */

/**
 * Where the current selection sits inside `root`, counted in plain characters.
 * The rendered DOM and the stored markup contain the same text in the same
 * order, so these offsets address both.
 */
export function selectionOffsets(root: HTMLElement): { start: number; end: number } | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;

  const before = range.cloneRange();
  before.selectNodeContents(root);
  before.setEnd(range.startContainer, range.startOffset);

  const start = before.toString().length;
  const end = start + range.toString().length;
  return end > start ? { start, end } : null;
}

function rangeFromOffsets(doc: Document, root: Node, start: number, end: number): Range | null {
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let pos = 0;
  let startNode: Node | null = null;
  let startOffset = 0;
  let endNode: Node | null = null;
  let endOffset = 0;
  let node: Node | null;

  while ((node = walker.nextNode())) {
    const len = (node.nodeValue ?? '').length;
    if (!startNode && pos + len >= start) {
      startNode = node;
      startOffset = start - pos;
    }
    if (startNode && pos + len >= end) {
      endNode = node;
      endOffset = end - pos;
      break;
    }
    pos += len;
  }

  if (!startNode || !endNode) return null;

  const range = doc.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  return range;
}

/**
 * Applies a format to a character range of stored markup and returns the new
 * markup. Used for the cards, which are not editable — the selection is mapped
 * to offsets and the change is made against the stored string instead.
 */
export function applyFormat(
  html: string,
  start: number,
  end: number,
  action: FormatAction
): string {
  const body = parse(html);
  if (!body) return html;

  const doc = body.ownerDocument;
  const range = rangeFromOffsets(doc, body, start, end);
  if (!range) return html;

  if (action.type === 'clear') {
    // Formatting is removed by replacing the span with its own words.
    const text = range.toString();
    range.deleteContents();
    range.insertNode(doc.createTextNode(text));
  } else {
    const tag =
      action.type === 'bold' ? 'strong' : action.type === 'underline' ? 'u' : 'mark';
    const wrapper = doc.createElement(tag);
    if (action.type === 'highlight') wrapper.className = action.color;

    try {
      range.surroundContents(wrapper);
    } catch {
      // The selection crossed an element boundary; move the contents instead.
      wrapper.appendChild(range.extractContents());
      range.insertNode(wrapper);
    }
  }

  body.normalize();
  return sanitizeRich(body.innerHTML);
}
