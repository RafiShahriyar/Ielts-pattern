'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { highlight } from '@/lib/highlight';
import { SIDEBAR_ID } from '@/lib/slots';
import { STRUCTURES, WRITING_SECTIONS } from '@/lib/writing-data';

const STRUCTURES_ID = 'structures';

export default function WritingView() {
  const [active, setActive] = useState<string>(WRITING_SECTIONS[0].id);
  const [sideSlot, setSideSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSideSlot(document.getElementById(SIDEBAR_ID));
  }, []);

  const section = WRITING_SECTIONS.find((s) => s.id === active);

  return (
    <>
      {sideSlot &&
        createPortal(
          <div className="side-block">
            <div className="side-label">Sections</div>
            <nav className="side-list">
              {WRITING_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  className={s.id === active ? 'side-item active' : 'side-item'}
                  onClick={() => setActive(s.id)}
                >
                  {s.title}
                </button>
              ))}
              <button
                className={active === STRUCTURES_ID ? 'side-item active' : 'side-item'}
                onClick={() => setActive(STRUCTURES_ID)}
              >
                Structures
              </button>
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
            <article className="card" key={format.id}>
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
                <article className="card" key={type.name}>
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
