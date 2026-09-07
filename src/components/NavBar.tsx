'use client';

import WindowControls from '@/components/WindowControls';

export type PageId = 'patterns' | 'writing' | 'vocab' | 'settings';

const TABS: { id: PageId; label: string }[] = [
  { id: 'patterns', label: 'Patterns' },
  { id: 'writing', label: 'Writing' },
  { id: 'vocab', label: 'Vocab' },
  { id: 'settings', label: 'Settings' },
];

interface Props {
  page: PageId;
  onNavigate: (page: PageId) => void;
}

/**
 * Doubles as the window title bar: the OS one is hidden, so this strip is the
 * drag handle, carries the app's own window buttons, and maximises on
 * double-click the way a real title bar does.
 *
 * Laid out as three columns so the tabs stay centred in the window whatever
 * sits either side of them.
 */
export default function NavBar({ page, onNavigate }: Props) {
  return (
    <header className="nav" onDoubleClick={() => window.api?.window?.toggleMaximize()}>
      <div className="nav-inner">
        <span className="nav-brand">IELTS Pattern Bank</span>

        <nav className="nav-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={tab.id === page ? 'nav-tab active' : 'nav-tab'}
              onClick={() => onNavigate(tab.id)}
              aria-current={tab.id === page ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <WindowControls />
    </header>
  );
}
