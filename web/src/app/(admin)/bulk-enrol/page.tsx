'use client';
import { useState } from 'react';
import { parseLearnersCsv, type CsvResult } from '@/lib/learning';
import { downloadCsv } from '@/lib/download';
import { useToast } from '@/components/ui';
import ui from '@/components/ui.module.css';
import s from '@/components/learning.module.css';
export default function BulkEnrolPage() {
  const [result, setResult] = useState<CsvResult | null>(null);
  const { toast, node } = useToast();
  return (
    <div className={s.narrow}>
      <label className={s.drop}>
        <strong>Choose a CSV file</strong>
        <span className={s.muted}>Columns: name, email</span>
        <input
          aria-label="Choose a CSV file"
          type="file"
          accept=".csv,text/csv"
          onChange={async e => {
            const file = e.target.files?.[0];
            if (file) {
              try {
                setResult(parseLearnersCsv(await file.text()));
              } catch {
                toast('Could not read this file.');
              }
            }
          }}
        />
      </label>
      <div className={s.actions}>
        <button
          className={ui.outline}
          onClick={() =>
            downloadCsv(
              'learners-template.csv',
              'name,email\nMercy Ibe,mercy@example.com',
            )
          }
        >
          Download template
        </button>
      </div>
      {result && (
        <>
          <div className={s.split}>
            <div className={s.count}>
              <strong>{result.learners.length}</strong>
              <small>ready to enrol</small>
            </div>
            <div className={`${s.count} ${s.warning}`}>
              <strong>{result.errors.length}</strong>
              <small>need fixing</small>
            </div>
          </div>
          {result.errors.map(e => (
            <p className={s.error} key={e}>
              {e}
            </p>
          ))}
          <div className={s.actions}>
            <button
              className={ui.outline}
              onClick={() =>
                downloadCsv(
                  'enrolment-errors.csv',
                  `Error\n${result.errors
                    .map(e => `"${e.replaceAll('"', '""')}"`)
                    .join('\n')}`,
                )
              }
            >
              Download error report
            </button>
            <button
              className={ui.button}
              disabled={!result.learners.length}
              onClick={() =>
                toast(
                  'CSV validated. Enrolment requires the admin API and course selection.',
                )
              }
            >
              Enrol {result.learners.length} learners
            </button>
          </div>
        </>
      )}
      {node}
    </div>
  );
}
