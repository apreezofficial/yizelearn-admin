'use client';
import { useState } from 'react';
import { useLearning } from '@/components/LearningProvider';
import { Icon } from '@/components/Icon';
import { useToast } from '@/components/ui';
import { downloadCsv, printDocument } from '@/lib/download';
import ui from '@/components/ui.module.css';
import s from '@/components/learning.module.css';
export default function ReportsPage() {
  const { cohorts } = useLearning();
  const [report, setReport] = useState('Completion');
  const [cohort, setCohort] = useState('All cohorts');
  const [dates, setDates] = useState('Last 30 days');
  const [view, setView] = useState('form');
  const { toast, node } = useToast();
  const rows = cohorts.filter(
    c => cohort === 'All cohorts' || c.name === cohort,
  );
  const csv = `Cohort,Completion,Period\n${rows
    .map(c => `"${c.name.replaceAll('"', '""')}",${c.completion}%,${dates}`)
    .join('\n')}`;
  const download = () => downloadCsv('completion-report.csv', csv);
  return (
    <div className={s.panel}>
      {view === 'ready' ? (
        <div className={s.success}>
          <div className={s.ring}>
            <Icon name="check" size={42} />
          </div>
          <h2>Your report is ready</h2>
          <p className={s.muted}>
            Completion report, {dates}
            <br />
            CSV
          </p>
          <div className={s.actions}>
            <button className={ui.button} onClick={download}>
              Download file
            </button>
          </div>
          <button className={ui.link} onClick={() => setView('form')}>
            Back to reports
          </button>
        </div>
      ) : view === 'preview' ? (
        <>
          <div className={s.heading}>
            <button className={ui.link} onClick={() => setView('form')}>
              ← Back
            </button>
            <h2>Completion report</h2>
          </div>
          <div className={ui.card} style={{ padding: 20 }}>
            <strong>Completion by cohort</strong>
            <div className={s.bars}>
              {rows.map(c => (
                <div key={c.id} className={s.bar}>
                  <strong>{c.completion}%</strong>
                  <span style={{ height: c.completion }} />
                  {c.name}
                </div>
              ))}
            </div>
          </div>
          {rows.map(c => (
            <div key={c.id} className={ui.row}>
              <span className={ui.rowCopy}>{c.name}</span>
              <strong>{c.completion}%</strong>
            </div>
          ))}
          <p className={s.muted}>
            Sample completion data. Live date filtering requires the reporting
            API.
          </p>
          <div className={s.actions}>
            <button className={ui.outline} onClick={() => setView('ready')}>
              Export CSV
            </button>
            <button
              className={ui.button}
              onClick={() => {
                if (
                  !printDocument(
                    'Completion report',
                    rows.map(c => [c.name, `${c.completion}%`]),
                  )
                )
                  toast('Allow popups to print or save this report as PDF.');
              }}
            >
              Export PDF
            </button>
          </div>
        </>
      ) : (
        <div className={s.narrow}>
          {['Completion', 'Grades', 'Engagement'].map((r, i) => (
            <button
              key={r}
              className={`${s.choice} ${report === r ? s.selected : ''}`}
              onClick={() => setReport(r)}
              aria-pressed={report === r}
            >
              <span className={ui.rowIcon}>
                <Icon name={i === 0 ? 'chart' : i === 1 ? 'award' : 'users'} />
              </span>
              <span>
                <strong>{r}</strong>
                <small>
                  {
                    [
                      'By cohort and date',
                      'Scores per course',
                      'Active time and logins',
                    ][i]
                  }
                </small>
              </span>
            </button>
          ))}
          <label className={ui.field}>
            <span className={ui.label}>Cohort</span>
            <select
              className={ui.input}
              value={cohort}
              onChange={e => setCohort(e.target.value)}
            >
              <option>All cohorts</option>
              {cohorts.map(c => (
                <option key={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className={ui.field}>
            <span className={ui.label}>Dates</span>
            <select
              className={ui.input}
              value={dates}
              onChange={e => setDates(e.target.value)}
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This quarter</option>
            </select>
          </label>
          {report !== 'Completion' && (
            <p className={s.muted}>
              No {report.toLowerCase()} data is available in this sample.
            </p>
          )}
          <div className={s.actions}>
            <button
              className={ui.button}
              disabled={report !== 'Completion'}
              onClick={() => setView('preview')}
            >
              Preview report
            </button>
          </div>
        </div>
      )}
      {node}
    </div>
  );
}
