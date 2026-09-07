'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { highlight } from '@/lib/highlight';
import { jumpToCard, scrollContentToTop } from '@/lib/scroll';
import { SIDEBAR_ID } from '@/lib/slots';
import { STRUCTURES, WRITING_SECTIONS } from '@/lib/writing-data';

const STRUCTURES_ID = 'structures';

/** Stable DOM id for a question-type card, so the sidebar can scroll to it. */
function cardId(sectionId: string, name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `qt-${sectionId}-${slug}`;
}

export default function WritingView() {
  const [active, setActive] = useState<string>(WRITING_SECTIONS[0].id);
  const [jumped, setJumped] = useState<string>('');
  const [sideSlot, setSideSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSideSlot(document.getElementById(SIDEBAR_ID));
  }, []);

  const section = WRITING_SECTIONS.find((s) => s.id === active);

  function selectSection(id: string) {
    setActive(id);
    setJumped('');
    // Back to the top of the section rather than wherever the last one was.
    scrollContentToTop();
  }

  function jumpTo(id: string) {
    setJumped(id);
    jumpToCard(id);
  }

  return (
    <>
      {sideSlot &&
        createPortal(
          <div className="side-block">
            <div className="side-label">Sections</div>
            <nav className="side-list">
              {WRITING_SECTIONS.map((s) => (
                <div key={s.id}>
                  <button
                    className={s.id === active ? 'side-item active' : 'side-item'}
                    onClick={() => selectSection(s.id)}
                  >
                    {s.title}
                  </button>

                  {s.id === active && (
                    <div className="side-sublist">
                      {s.types.map((t) => {
                        const id = cardId(s.id, t.name);
                        return (
                          <button
                            key={t.name}
                            className={id === jumped ? 'side-subitem active' : 'side-subitem'}
                            onClick={() => jumpTo(id)}
                          >
                            {t.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              <div>
                <button
                  className={active === STRUCTURES_ID ? 'side-item active' : 'side-item'}
                  onClick={() => selectSection(STRUCTURES_ID)}
                >
                  Structures
                </button>

                {active === STRUCTURES_ID && (
                  <div className="side-sublist">
                    {STRUCTURES.map((f) => (
                      <button
                        key={f.id}
                        className={f.id === jumped ? 'side-subitem active' : 'side-subitem'}
                        onClick={() => jumpTo(f.id)}
                      >
                        {f.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>,
          sideSlot
        )}

      <div className="page-head">
        <div className="titlerow">
          <h1>Writing</h1>
          <span className="count">question types, formats and model sentences</span>
        </div>
      </div>

      {active === STRUCTURES_ID ? (
        <div className="list">
          {STRUCTURES.map((format) => (
            <article className="card" id={format.id} key={format.id}>
              <div className="card-head">
                <span className="chip">{format.title}</span>
              </div>
              <p className="section-note">{format.note}</p>
              <ol className="steps">
                {format.steps.map((step) => (
                  <li key={step.label}>
                    <span className="step-label">{step.label}</span>
                    <span className="step-detail">{step.detail}</span>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      ) : (
        section && (
          <>
            <div className="section-intro">
              <div className="section-meta">{section.meta}</div>
              <p>{section.blurb}</p>
            </div>

            <div className="list">
              {section.types.map((type) => (
                <article className="card" id={cardId(section.id, type.name)} key={type.name}>
                  <div className="card-head">
                    <span className="chip">{type.name}</span>
                  </div>

                  <div className="field">
                    <div className="label">Question format</div>
                    <div className="pattern-text">{highlight(type.prompt, 'slot')}</div>
                  </div>

                  <div className="field">
                    <div className="label">What it wants</div>
                    <div className="notes-text">{type.focus}</div>
                  </div>

                  <div className="field">
                    <div className="label">Example</div>
                    <div className="example-text">{highlight(type.example, 'num')}</div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )
      )}
    </>
  );
}
