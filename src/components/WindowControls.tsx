'use client';

import { useEffect, useState } from 'react';

/**
 * Minimise / maximise / close, drawn by the app because the OS title bar is
 * hidden. They inherit the theme's text colour, so they sit on the nav strip
 * with no chrome of their own.
 */
export default function WindowControls() {
  const [maximized, setMaximized] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // macOS keeps its own traffic lights; only Windows and Linux need these.
    if (!window.api?.window || window.api.platform === 'darwin') return;
    setShow(true);
    return window.api.window.onMaximized(setMaximized);
  }, []);

  if (!show) return null;

  return (
    <div className="win-controls">
      <button
        className="win-btn"
        onClick={() => window.api.window.minimize()}
        aria-label="Minimise"
        title="Minimise"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M0 5.5h10" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>

      <button
        className="win-btn"
        onClick={() => window.api.window.toggleMaximize()}
        aria-label={maximized ? 'Restore' : 'Maximise'}
        title={maximized ? 'Restore' : 'Maximise'}
      >
        {maximized ? (
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path
              d="M2.5 2.5V0.5h7v7h-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <rect
              x="0.5"
              y="2.5"
              width="7"
              height="7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <rect
              x="0.5"
              y="0.5"
              width="9"
              height="9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        )}
      </button>

      <button
        className="win-btn close"
        onClick={() => window.api.window.close()}
        aria-label="Close"
        title="Close"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M0.5 0.5l9 9M9.5 0.5l-9 9" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>
    </div>
  );
}
