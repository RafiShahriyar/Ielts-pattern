/** Breathing room left above a card when jumping to it. */
const JUMP_GAP = 14;

/**
 * Scrolls the content column to a card.
 *
 * Measured against the scroll container rather than using `scrollIntoView`,
 * which resolves offsets differently in a nested scroller. The smooth scroll is
 * a compositor animation and is skipped outright when the window is occluded,
 * which leaves the jump silently doing nothing — so it snaps to the target if
 * the animation has not landed.
 */
export function jumpToCard(id: string): void {
  const el = document.getElementById(id);
  const scroller = document.querySelector<HTMLElement>('.scroll');
  if (!el || !scroller) return;

  const delta = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
  const max = scroller.scrollHeight - scroller.clientHeight;
  const target = Math.max(0, Math.min(scroller.scrollTop + delta - JUMP_GAP, max));

  scroller.scrollTo({ top: target, behavior: 'smooth' });

  window.setTimeout(() => {
    if (Math.abs(scroller.scrollTop - target) > 2) scroller.scrollTo({ top: target });
  }, 400);
}

/** Back to the top, e.g. after switching section. */
export function scrollContentToTop(): void {
  document.querySelector('.scroll')?.scrollTo({ top: 0, behavior: 'auto' });
}
