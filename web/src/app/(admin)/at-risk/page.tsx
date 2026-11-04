'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLearning } from '@/components/LearningProvider';
import { Avatar, Badge, Chips, Dialog, Empty, useToast } from '@/components/ui';
import ui from '@/components/ui.module.css';
import s from '@/components/learning.module.css';
export default function AtRiskPage() {
  return (
    <Suspense>
      <Learners />
    </Suspense>
  );
}
function Learners() {
  const initial = useSearchParams().get('learner');
  const { people } = useLearning();
  const [id, setId] = useState(initial);
  const [course, setCourse] = useState(false);
  const [filter, setFilter] = useState('All');
  const [reminding, setReminding] = useState(false);
  const [message, setMessage] = useState('Your course is waiting for you.');
  const { toast, node } = useToast();
  const person = people.find(p => p.id === id);
  const shown = people.filter(
    p =>
      p.cohort && p.progress < 40 && (filter === 'All' || filter === p.state),
  );
  return (
    <div className={s.narrow}>
      {person ? (
        <>
          <button
            className={ui.link}
            onClick={() => (course ? setCourse(false) : setId(null))}
          >
            ← Back
          </button>
          {course ? (
            <>
              <h2>Data analysis in Excel</h2>
              <div className={s.warning}>
                Progress
                <div className={s.progress}>
                  <span style={{ width: `${person.progress}%` }} />
                </div>
                {Math.round((person.progress * 24) / 100)} of 24 lessons
              </div>
              {[
                ['Module 1 quiz', '90%'],
                ['Module 2 quiz', 'Not taken'],
                ['Assignment 1', 'Not submitted'],
              ].map(([k, v]) => (
                <div key={k} className={ui.row}>
                  <span className={ui.rowCopy}>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className={s.profile}>
                <Avatar name={person.name} size={76} />
                <h2>{person.name}</h2>
                <span className={s.muted}>
                  Student, {person.cohort || 'Not in a cohort'}
                </span>
              </div>
              <div className={s.warning}>
                Overall progress
                <div className={s.progress}>
                  <span style={{ width: `${person.progress}%` }} />
                </div>
                <strong>{person.progress}%</strong>
                <span style={{ float: 'right' }}>Behind schedule</span>
              </div>
              <button className={ui.row} onClick={() => setCourse(true)}>
                <span className={ui.rowCopy}>Data analysis in Excel</span>
                <strong>{person.progress}%</strong>
              </button>
              <div className={ui.row}>
                <span className={ui.rowCopy}>Business writing</span>
                <strong>Not started</strong>
              </div>
            </>
          )}
          <div className={s.actions}>
            <button className={ui.button} onClick={() => setReminding(true)}>
              Send reminder
            </button>
          </div>
        </>
      ) : (
        <>
          <Chips
            items={['All', 'Behind', 'Not started']}
            active={filter}
            onSelect={setFilter}
          />
          {shown.map(p => (
            <button key={p.id} className={ui.row} onClick={() => setId(p.id)}>
              <Avatar name={p.name} />
              <span className={ui.rowCopy}>
                <strong>{p.name}</strong>
                <span>
                  {p.cohort}, {p.progress}%
                </span>
              </span>
              <Badge label="Pending" tone="gold" />
            </button>
          ))}
          {!shown.length && (
            <Empty title="No learners here" message="Try another filter." />
          )}
        </>
      )}
      {reminding && (
        <Dialog
          title="Send reminder"
          onClose={() => setReminding(false)}
          actions={
            <>
              <button
                className={ui.outline}
                onClick={() => setReminding(false)}
              >
                Cancel
              </button>
              <button
                className={ui.button}
                disabled={!message.trim()}
                onClick={() => {
                  setReminding(false);
                  toast(
                    'Reminder prepared. Delivery requires the messaging API.',
                  );
                }}
              >
                Send reminder
              </button>
            </>
          }
        >
          <p className={s.muted}>
            {person?.name}, {person?.cohort}
          </p>
          <label className={ui.label} htmlFor="reminder">
            Message
          </label>
          <textarea
            id="reminder"
            className={ui.input}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </Dialog>
      )}
      {node}
    </div>
  );
}
