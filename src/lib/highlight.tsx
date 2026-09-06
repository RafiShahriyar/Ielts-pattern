import type { ReactNode } from 'react';

// Numbers, percentages and figures like 52%, 1,200, 3.5 — the data points that
// carry the meaning in a Task 1 sentence.
const NUMBER_SOURCE = String.raw`\d+(?:,\d+)*(?:\.\d+)?\s?%|\d+(?:,\d+)*(?:\.\d+)?`;

// Template slots such as [topic] or [X].
const SLOT_SOURCE = String.raw`\[[^\]\n]+\]`;

type Kind = 'num' | 'slot';

/**
 * Splits `text` into plain strings and <mark> nodes around every match.
 * A fresh RegExp per call keeps `lastIndex` from leaking between renders.
 */
export function highlight(text: string, kind: Kind): ReactNode[] {
  const re = new RegExp(kind === 'num' ? NUMBER_SOURCE : SLOT_SOURCE, 'g');
  const nodes: ReactNode[] = [];
  let last = 0;

  for (const match of text.matchAll(re)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    nodes.push(
      <mark className={kind} key={`${kind}-${start}`}>
        {match[0]}
      </mark>
    );
    last = start + match[0].length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
