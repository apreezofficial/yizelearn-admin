'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLearning } from '@/components/LearningProvider';
import { Avatar, Badge, Chips, Dialog, Empty, Search } from '@/components/ui';
import { Icon } from '@/components/Icon';
import {
  learningCourses,
  parseLearnersCsv,
  type Cohort,
  type Learner,
} from '@/lib/learning';
import { downloadCsv } from '@/lib/download';
import ui from '@/components/ui.module.css';
import s from '@/components/learning.module.css';
export default function CohortsPage() {
  const { cohorts, people, add } = useLearning();
  const router = useRouter();
  const [view, setView] = useState('list');
  const [filter, setFilter] = useState<'Active' | 'Finished'>('Active');
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [tab, setTab] = useState<'Learners' | 'Courses' | 'Activity'>(
    'Learners',
  );
  const [name, setName] = useState('');
  const [start, setStart] = useState('2026-11-01');
  const [end, setEnd] = useState('2026-12-31');
  const [goal, setGoal] = useState('80');
  const [picked, setPicked] = useState<string[]>([]);
  const [assigned, setAssigned] = useState<string[]>([]);
  const [release, setRelease] = useState('All at once');
  const [schedule, setSchedule] = useState(false);
  const [query, setQuery] = useState('');
  const [imported, setImported] = useState<Learner[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const allPeople = [
    ...people,
    ...imported.filter(p => !people.some(x => x.id === p.id)),
  ];
  const toggle = (x: string, list: string[], update: (v: string[]) => void) =>
    update(list.includes(x) ? list.filter(i => i !== x) : [...list, x]);
  const choose = async (file?: File) => {
    if (!file) return;
    try {
      const result = parseLearnersCsv(await file.text());
      setImported(
        result.learners.map(p => {
          const existing = people.find(
            x => x.email.toLowerCase() === p.email.toLowerCase(),
          );
          return existing ? { ...existing, name: p.name } : p;
        }),
      );
      setErrors(result.errors);
      setView('checked');
    } catch {
      setErrors(['Could not read file. Please try another CSV.']);
      setView('checked');
    }
  };
  const create = () => {
    const c: Cohort = {
      id: `cohort-${Date.now()}`,
      name: name.trim(),
      start,
      end,
      goal: Number(goal),
      learners: picked,
      courses: assigned,
      completion: 0,
      finished: false,
      release,
    };
    add(
      c,
      imported.filter(p => picked.includes(p.id)),
    );
    setCohort(c);
    setView('created');
  };
  const step =
    view === 'new'
      ? 1
      : ['learners', 'csv', 'checked'].includes(view)
      ? 2
      : view === 'courses'
      ? 3
      : 0;
  const back = () =>
    setView(
      view === 'courses'
        ? 'learners'
        : view === 'learners'
        ? 'new'
        : ['csv', 'checked'].includes(view)
        ? 'learners'
        : 'list',
    );
  if (view === 'created')
    return (
      <div className={s.success}>
        <div className={s.ring}>
          <Icon name="check" size={42} />
        </div>
        <h2>Cohort created</h2>
        <p className={s.muted}>
          {cohort?.name} has {cohort?.learners.length} learners and{' '}
          {cohort?.courses.length} courses.
        </p>
        <div className={s.actions}>
          <button className={ui.button} onClick={() => setView('detail')}>
            View cohort
          </button>
        </div>
        <button className={ui.link} onClick={() => setView('list')}>
          Back to cohorts
        </button>
      </div>
    );
  return (
    <div className={s.panel}>
      {view !== 'list' && (
        <div className={s.heading}>
          <button className={ui.link} onClick={back}>
            ← Back
          </button>
          <h2>
            {view === 'detail'
              ? cohort?.name
              : view === 'new'
              ? 'New cohort'
              : view === 'courses'
              ? 'Assign courses'
              : view === 'csv'
              ? 'Upload CSV'
              : view === 'checked'
              ? 'CSV checked'
              : 'Add learners'}
          </h2>
          <span />
        </div>
      )}
      {!!step && (
        <>
          <div className={s.progress}>
            <span style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          <p className={s.muted}>
            Step {step} of 3: {['Details', 'Learners', 'Courses'][step - 1]}
          </p>
        </>
      )}
      {view === 'list' && (
        <>
          <div className={s.heading}>
            <Chips
              items={['Active', 'Finished'] as const}
              active={filter}
              onSelect={setFilter}
            />
            <button
              className={ui.button}
              onClick={() => {
                setName('');
                setPicked([]);
                setAssigned([]);
                setImported([]);
                setView('new');
              }}
            >
              + New cohort
            </button>
          </div>
          {cohorts
            .filter(c => c.finished === (filter === 'Finished'))
            .map(c => (
              <button
                key={c.id}
                className={ui.row}
                onClick={() => {
                  setCohort(c);
                  setTab('Learners');
                  setView('detail');
                }}
              >
                <span className={ui.rowIcon}>
                  <Icon name="users" />
                </span>
                <span className={ui.rowCopy}>
                  <strong>{c.name}</strong>
                  <span>
                    {c.learners.length} learners, {c.completion}%
                  </span>
                </span>
                <Badge label={c.finished ? 'Done' : 'Active'} tone="green" />
              </button>
            ))}
        </>
      )}
      {view === 'new' && (
        <form
          onSubmit={e => {
            e.preventDefault();
            setView('learners');
          }}
        >
          <label className={ui.field}>
            <span className={ui.label}>Cohort name</span>
            <input
              className={ui.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Sales team, November"
              required
            />
          </label>
          <div className={s.split}>
            <label className={ui.field}>
              <span className={ui.label}>Start date</span>
              <input
                type="date"
                className={ui.input}
                value={start}
                onChange={e => setStart(e.target.value)}
                required
              />
            </label>
            <label className={ui.field}>
              <span className={ui.label}>End date</span>
              <input
                type="date"
                min={start}
                className={ui.input}
                value={end}
                onChange={e => setEnd(e.target.value)}
                required
              />
            </label>
          </div>
          <label className={ui.field}>
            <span className={ui.label}>Completion goal (%)</span>
            <input
              type="number"
              min="1"
              max="100"
              className={ui.input}
              value={goal}
              onChange={e => setGoal(e.target.value)}
              required
            />
          </label>
          <div className={s.actions}>
            <button
              className={ui.button}
              disabled={
                !name.trim() ||
                !start ||
                !end ||
                end < start ||
                !(Number(goal) > 0 && Number(goal) <= 100)
              }
            >
              Next: add learners
            </button>
          </div>
        </form>
      )}
      {view === 'learners' && (
        <>
          <Chips
            items={['Pick from list', 'Upload CSV']}
            active="Pick from list"
            onSelect={v => v === 'Upload CSV' && setView('csv')}
          />
          <div style={{ margin: '16px 0' }}>
            <Search
              value={query}
              onChange={setQuery}
              placeholder="Search learners"
            />
          </div>
          {allPeople
            .filter(p =>
              `${p.name} ${p.email}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map(p => (
              <label className={s.choice} key={p.id}>
                <input
                  type="checkbox"
                  checked={picked.includes(p.id)}
                  onChange={() => toggle(p.id, picked, setPicked)}
                />
                <Avatar name={p.name} />
                <span>
                  <strong>{p.name}</strong>
                  <small>{p.email}</small>
                </span>
              </label>
            ))}
          <div className={s.actions}>
            <button
              className={ui.button}
              disabled={!picked.length}
              onClick={() => setView('courses')}
            >
              Add {picked.length} learners
            </button>
          </div>
        </>
      )}
      {view === 'csv' && (
        <>
          <label className={s.drop}>
            <Icon name="file" size={32} />
            <strong>Choose a CSV file</strong>
            <span className={s.muted}>Columns: name, email</span>
            <input
              aria-label="Choose a CSV file"
              type="file"
              accept=".csv,text/csv"
              onChange={e => void choose(e.target.files?.[0])}
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
        </>
      )}
      {view === 'checked' && (
        <>
          <div className={s.split}>
            <div className={s.count}>
              <strong>{imported.length}</strong>
              <small>ready to add</small>
            </div>
            <div className={`${s.count} ${s.warning}`}>
              <strong>{errors.length}</strong>
              <small>need fixing</small>
            </div>
          </div>
          {errors.map(e => (
            <p className={s.error} key={e}>
              {e}
            </p>
          ))}
          <h3>Preview</h3>
          {imported.map(p => (
            <div key={p.id} className={ui.row}>
              <Avatar name={p.name} />
              <span className={ui.rowCopy}>
                <strong>{p.name}</strong>
                <span>{p.email}</span>
              </span>
            </div>
          ))}
          <div className={s.actions}>
            <button className={ui.outline} onClick={() => setView('csv')}>
              Choose another file
            </button>
            <button
              className={ui.button}
              disabled={!imported.length}
              onClick={() => {
                setPicked(x => [
                  ...new Set([...x, ...imported.map(p => p.id)]),
                ]);
                setView('courses');
              }}
            >
              Add {imported.length} learners
            </button>
          </div>
        </>
      )}
      {view === 'courses' && (
        <>
          {learningCourses.map(c => (
            <div
              key={c}
              className={`${s.choice} ${
                assigned.includes(c) ? s.selected : ''
              }`}
            >
              <input
                aria-label={c}
                type="checkbox"
                checked={assigned.includes(c)}
                onChange={() => toggle(c, assigned, setAssigned)}
              />
              <div>
                <strong>{c}</strong>
                <button
                  className={ui.link}
                  style={{ marginTop: 8, fontSize: 12 }}
                  onClick={() => setSchedule(true)}
                >
                  {release} · Change schedule
                </button>
              </div>
            </div>
          ))}
          <div className={s.actions}>
            <button
              className={ui.button}
              disabled={!assigned.length}
              onClick={create}
            >
              Create cohort
            </button>
          </div>
        </>
      )}
      {view === 'detail' && cohort && (
        <>
          <div className={s.hero}>
            <span>Completion</span>
            <strong>{cohort.completion}%</strong>
            <div className={s.progress}>
              <span style={{ width: `${cohort.completion}%` }} />
            </div>
          </div>
          <Chips
            items={['Learners', 'Courses', 'Activity'] as const}
            active={tab}
            onSelect={setTab}
          />
          {tab === 'Learners' &&
            allPeople
              .filter(p => cohort.learners.includes(p.id))
              .map(p => (
                <button
                  key={p.id}
                  className={ui.row}
                  onClick={() =>
                    router.push(`/at-risk?learner=${encodeURIComponent(p.id)}`)
                  }
                >
                  <Avatar name={p.name} />
                  <span className={ui.rowCopy}>
                    <strong>{p.name}</strong>
                    <span>Progress {p.progress}%</span>
                  </span>
                  <Icon name="next" />
                </button>
              ))}
          {tab === 'Courses' &&
            cohort.courses.map(c => (
              <div key={c} className={ui.row}>
                <span className={ui.rowCopy}>
                  <strong>{c}</strong>
                  <span>{cohort.release}</span>
                </span>
              </div>
            ))}
          {tab === 'Activity' && (
            <p className={s.muted}>
              Scheduled {cohort.start} to {cohort.end}. Completion goal:{' '}
              {cohort.goal}%.
            </p>
          )}
          <div className={s.actions}>
            <button
              className={ui.button}
              onClick={() =>
                router.push(
                  `/settings?tab=Announcement&cohort=${encodeURIComponent(
                    cohort.name,
                  )}`,
                )
              }
            >
              Message cohort
            </button>
          </div>
          {!cohort.learners.length && (
            <Empty
              title="No learners"
              message="This cohort has no learners yet."
            />
          )}
        </>
      )}
      {schedule && (
        <Dialog
          title="Release schedule"
          onClose={() => setSchedule(false)}
          actions={
            <button className={ui.button} onClick={() => setSchedule(false)}>
              Save
            </button>
          }
        >
          {['All at once', 'One module a week'].map(r => (
            <label
              key={r}
              className={`${s.choice} ${release === r ? s.selected : ''}`}
            >
              <input
                type="radio"
                name="release"
                checked={release === r}
                onChange={() => setRelease(r)}
              />
              {r}
            </label>
          ))}
        </Dialog>
      )}
    </div>
  );
}
