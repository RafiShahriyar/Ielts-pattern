import { createElement, Fragment, type ReactNode } from 'react';
import { highlight } from './highlight';

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

function parse(html: string): HTMLElement | null {
  if (typeof DOMParser === 'undefined') return null;
  return new DOMParser().parseFromString(html, 'text/html').body;
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

    const clean = document.createElement(tag);
    if (tag === 'mark') clean.className = 'hl';
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
export function renderRich(
  html: string,
  kind: 'num' | 'slot' | null = null
): ReactNode {
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
        { key: i, ...(tag === 'mark' ? { className: 'hl' } : {}) },
        toReact(el.childNodes, kind)
      )
    );
  });

  return out;
}
