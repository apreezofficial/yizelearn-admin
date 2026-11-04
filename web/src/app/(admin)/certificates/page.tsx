'use client';
import { useState } from 'react';
import { certificates } from '@/lib/learning';
import { Chips, Empty, Search, useToast } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { printDocument } from '@/lib/download';
import ui from '@/components/ui.module.css';
import s from '@/components/learning.module.css';
export default function CertificatesPage() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<
    (typeof certificates)[number] | null
  >(null);
  const [filter, setFilter] = useState('All');
  const { toast, node } = useToast();
  const shown = certificates.filter(
    c =>
      `${c.name} ${c.course} ${c.id}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === 'All' ||
        (new Date(c.issued).getMonth() === new Date().getMonth() &&
          new Date(c.issued).getFullYear() === new Date().getFullYear())),
  );
  return (
    <div className={s.narrow}>
      {selected ? (
        <>
          <button className={ui.link} onClick={() => setSelected(null)}>
            ← Back to certificates
          </button>
          <div className={s.summary}>
            <span className={s.muted}>{selected.course}</span>
            <h2>{selected.name}</h2>
          </div>
          {[
            ['ID', selected.id],
            ['Score', `${selected.score}%`],
            ['Issued', selected.issued],
          ].map(([k, v]) => (
            <div key={k} className={ui.row}>
              <span className={ui.rowCopy}>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
          <div className={s.actions}>
            <button
              className={ui.outline}
              onClick={() =>
                toast('Resending requires the admin messaging API.')
              }
            >
              Resend to learner
            </button>
            <button
              className={ui.button}
              onClick={() => {
                if (
                  !printDocument('Certificate of completion', [
                    ['Learner', selected.name],
                    ['Course', selected.course],
                    ['ID', selected.id],
                    ['Score', `${selected.score}%`],
                    ['Issued', selected.issued],
                  ])
                )
                  toast(
                    'Allow popups to print or save this certificate as PDF.',
                  );
              }}
            >
              Download PDF
            </button>
          </div>
        </>
      ) : (
        <>
          <Search
            value={query}
            onChange={setQuery}
            placeholder="Search certificates"
          />
          <div style={{ margin: '14px 0' }}>
            <Chips
              items={['All', 'This month']}
              active={filter}
              onSelect={setFilter}
            />
          </div>
          {shown.map(c => (
            <button
              key={c.id}
              className={ui.row}
              onClick={() => setSelected(c)}
            >
              <span className={ui.rowIcon}>
                <Icon name="award" />
              </span>
              <span className={ui.rowCopy}>
                <strong>{c.name}</strong>
                <span>
                  {c.course}, {c.issued}
                </span>
              </span>
              <Icon name="next" />
            </button>
          ))}
          {!shown.length && (
            <Empty
              title="No certificates found"
              message="Try another search or date filter."
            />
          )}
        </>
      )}
      {node}
    </div>
  );
}
