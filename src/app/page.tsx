'use client';

import { useEffect, useState } from 'react';
import NavBar, { type PageId } from '@/components/NavBar';
import PatternsView from '@/components/PatternsView';
import WritingView from '@/components/WritingView';
import SettingsView from '@/components/SettingsView';
import { applyTheme, isThemeId, type ThemeId } from '@/lib/theme';
import { SIDEBAR_ID } from '@/lib/slots';

export default function Home() {
  const [page, setPage] = useState<PageId>('patterns');
  const [theme, setTheme] = useState<ThemeId>('system');

  useEffect(() => {
    // The attribute is already set by the bootstrap script in layout.tsx; this
    // only brings React state in line so Settings shows the right selection.
    const initial = window.api?.initialTheme;
    if (isThemeId(initial)) setTheme(initial);
    if (window.api?.platform) document.documentElement.dataset.platform = window.api.platform;
  }, []);

  async function changeTheme(next: ThemeId) {
    setTheme(next);
    applyTheme(next);
    try {
      await window.api?.setTheme(next);
    } catch {
      /* the choice still applies for this session even if it cannot be saved */
    }
  }

  return (
    <>
      <NavBar page={page} onNavigate={setPage} />

      <div className="body">
        <aside className="sidebar" id={SIDEBAR_ID} />

        <main className="scroll">
          <div className="app">
            {page === 'patterns' && <PatternsView />}
            {page === 'writing' && <WritingView />}
            {page === 'settings' && <SettingsView theme={theme} onThemeChange={changeTheme} />}
          </div>
        </main>
      </div>
    </>
  );
}
