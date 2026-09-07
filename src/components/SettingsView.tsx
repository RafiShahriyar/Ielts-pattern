'use client';

import { useEffect, useState } from 'react';
import { THEME_GROUPS, themesInGroup, type ThemeId } from '@/lib/theme';

interface Props {
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
}

export default function SettingsView({ theme, onThemeChange }: Props) {
  const [dbPath, setDbPath] = useState('');
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!window.api) return;
    void (async () => {
      try {
        const [p, rows] = await Promise.all([window.api.dbPath(), window.api.list()]);
        setDbPath(p);
        setCount(rows.length);
      } catch {
        /* the patterns page already surfaces database errors */
      }
    })();
  }, []);

  return (
    <>
      <div className="page-head">
        <div className="titlerow">
          <h1>Settings</h1>
        </div>
      </div>

      <section className="card settings-card">
        <h2 className="settings-title">Theme</h2>
        <p className="section-note">Applies immediately and is remembered between launches.</p>

        {THEME_GROUPS.map((group) => (
          <div className="theme-group" key={group.id}>
            <div className="theme-group-label">{group.label}</div>
            <div className="theme-grid">
              {themesInGroup(group.id).map((option) => (
                <button
                  key={option.id}
                  className={option.id === theme ? 'theme-option active' : 'theme-option'}
                  onClick={() => onThemeChange(option.id)}
                  aria-pressed={option.id === theme}
                >
                  <span className="theme-swatch" aria-hidden="true">
                    {option.swatch.map((colour, i) => (
                      <span key={i} style={{ background: colour }} />
                    ))}
                  </span>
                  <span className="theme-text">
                    <span className="theme-label">{option.label}</span>
                    <span className="theme-hint">{option.hint}</span>
                  </span>
                  {option.id === theme && <span className="theme-check">✓</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="card settings-card">
        <h2 className="settings-title">Storage</h2>
        <p className="section-note">
          Entries live in a SQLite database on this machine
          {count === null ? '' : ` — ${count} ${count === 1 ? 'pattern' : 'patterns'} stored`}.
        </p>
        {dbPath && <div className="path-box">{dbPath}</div>}
        <div className="settings-actions">
          <button className="btn" onClick={() => window.api?.revealDb()}>
            Show database file
          </button>
        </div>
      </section>

      <section className="card settings-card">
        <h2 className="settings-title">Shortcuts</h2>
        <dl className="shortcut-list">
          <div>
            <dt>Ctrl + K</dt>
            <dd>Focus search on the Patterns page</dd>
          </div>
          <div>
            <dt>Ctrl + N</dt>
            <dd>New pattern</dd>
          </div>
          <div>
            <dt>Ctrl + Enter</dt>
            <dd>Save the open form</dd>
          </div>
          <div>
            <dt>Esc</dt>
            <dd>Close the form</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
