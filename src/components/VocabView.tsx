'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { highlight } from '@/lib/highlight';
import { jumpToCard } from '@/lib/scroll';
import { SIDEBAR_ID } from '@/lib/slots';
import { VOCAB_GROUPS, VOCAB_SECTIONS, type VocabGroup } from '@/lib/vocab-data';

function matches(group: VocabGroup, needle: string): VocabGroup | null {
  if (!needle) return group;

  const q = needle.toLowerCase();
  if (group.title.toLowerCase().includes(q)) return group;

  const items = group.items.filter((i) =>
    `${i.word} ${i.use} ${i.example}`.toLowerCase().includes(q)
  );
  return items.length ? { ...group, items } : null;
}

export default function VocabView() {
  const [search, setSearch] = useState('');
  const [jumped, setJumped] = useState('');
  const [sideSlot, setSideSlot] = useState<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSideSlot(document.getElementById(SIDEBAR_ID));
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const groups = useMemo(
    () => VOCAB_GROUPS.map((g) => matches(g, search.trim())).filter(Boolean) as VocabGroup[],
    [search]
  );

  const wordCount = groups.reduce((n, g) => n + g.items.length, 0);

  function goTo(id: string) {
    setJumped(id);
    jumpToCard(id);
  }

  return (
    <>
      {sideSlot &&
        createPortal(
          <>
            <div className="side-block">
              <div className="search">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search words…  Ctrl+K"
                  spellCheck={false}
                />
                {search && (
                  <button className="clear" onClick={() => setSearch('')} title="Clear search">
                    ×
                  </button>
                )}
              </div>
            </div>

            {VOCAB_SECTIONS.map((section) => {
              const inSection = groups.filter((g) => g.kind === section.kind);
              if (!inSection.length) return null;
              return (
                <div className="side-block" key={section.kind}>
                  <div className="side-label">{section.label}</div>
                  <nav className="side-list">
                    {inSection.map((g) => (
                      <button
                        key={g.id}
                        className={g.id === jumped ? 'side-item active' : 'side-item'}
                        onClick={() => goTo(g.id)}
                      >
                        {g.title}
                      </button>
                    ))}
                  </nav>
                </div>
              );
            })}
          </>,
          sideSlot
        )}

      <div className="page-head">
        <div className="titlerow">
          <h1>Vocab</h1>
          <span className="count">
            {wordCount} {wordCount === 1 ? 'entry' : 'entries'}
            {search ? ' matching' : ' — linking words and Task 1 language'}
          </span>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="empty-state">
          <p>Nothing matches that search.</p>
        </div>
      ) : (
        <div className="list">
          {groups.map((group) => (
            <article className="card" id={group.id} key={group.id}>
              <div className="card-head">
                <span className="chip">{group.title}</span>
              </div>
              <p className="section-note">{group.blurb}</p>

              <div className="vocab-list">
                {group.items.map((item) => (
                  <div className="vocab-item" key={item.word}>
                    <div className="vocab-word">{item.word}</div>
                    <div className="vocab-use">{item.use}</div>
                    <div className="vocab-example">{highlight(item.example, 'num')}</div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
