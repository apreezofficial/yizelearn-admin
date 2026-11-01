'use client';

import {useSearchParams} from 'next/navigation';
import {Suspense, useState} from 'react';
import {Badge, Chips, Dialog, Empty, Search, useToast} from '@/components/ui';
import ui from '@/components/ui.module.css';
import {courses as seed, statusTone, type AdminCourse} from '@/lib/data';
import s from '../list.module.css';

const filters = ['All', 'In review', 'Published'] as const;
type Filter = (typeof filters)[number];

export default function CoursesPage() {
  return <Suspense><Courses /></Suspense>;
}

function Courses() {
  const initial = useSearchParams().get('filter');
  const [courses, setCourses] = useState<AdminCourse[]>(seed);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>(filters.includes(initial as Filter) ? (initial as Filter) : 'All');
  const [open, setOpen] = useState<AdminCourse | null>(null);
  const [deleting, setDeleting] = useState<AdminCourse | null>(null);
  const {toast, node} = useToast();
  const q = query.trim().toLowerCase();
  const shown = courses.filter(c => (filter === 'All' || c.status === filter) && (!q || c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q)));
  const act = (change: Partial<AdminCourse>, msg: string) => { if (!open) return; setCourses(l => l.map(c => (c.id === open.id ? {...c, ...change} : c))); toast(msg); setOpen(null); };

  return <>
    <div className={s.tools}>
      <Search value={query} onChange={setQuery} placeholder="Search courses" />
      <Chips items={filters} active={filter} onSelect={setFilter} />
    </div>
    <div className={`${ui.card} ${s.panel}`}>
      {shown.length ? <table className={ui.table}>
        <thead><tr><th>Course</th><th>Instructor</th><th>Status</th></tr></thead>
        <tbody>{shown.map((c, i) => <tr key={c.id} className={`${ui.clickable} rise`} style={{animationDelay: `${i * 40}ms`}} onClick={() => setOpen(c)}>
          <td><strong>{c.title}</strong>{c.featured && <> <Badge label="Featured" tone="blue" /></>}</td>
          <td>{c.instructor}</td>
          <td><Badge label={c.status} tone={statusTone[c.status]} /></td>
        </tr>)}</tbody>
      </table> : <Empty title="No courses here" message={filter === 'In review' ? 'Nothing is waiting for review.' : 'Try another search.'} />}
    </div>

    {open && <Dialog title={open.title} onClose={() => setOpen(null)} actions={<button className={ui.outline} onClick={() => setOpen(null)}>Close</button>}>
      {open.status !== 'Published' && <button className={ui.row} onClick={() => act({status: 'Published'}, `${open.title} is published`)}><span className={ui.rowIcon}>✓</span><span className={ui.rowCopy}><strong>Review and approve</strong><span>Publish to the catalog</span></span></button>}
      <button className={ui.row} onClick={() => act({featured: !open.featured}, open.featured ? 'Removed from Top courses' : 'Now in Top courses')}><span className={ui.rowIcon}>★</span><span className={ui.rowCopy}><strong>{open.featured ? 'Remove from home' : 'Feature on home'}</strong><span>{open.featured ? 'Take it out of Top courses' : 'Show in Top courses'}</span></span></button>
      {open.status === 'Published' && <button className={ui.row} onClick={() => act({status: 'Unpublished', featured: false}, `${open.title} is hidden from the catalog`)}><span className={ui.rowIcon}>🔒</span><span className={ui.rowCopy}><strong>Unpublish</strong><span>Hide from the catalog</span></span></button>}
      <button className={ui.row} onClick={() => { setDeleting(open); setOpen(null); }}><span className={ui.rowIcon} style={{background: 'var(--danger-soft)', color: 'var(--danger)'}}>✕</span><span className={ui.rowCopy}><strong style={{color: 'var(--danger)'}}>Delete course</strong></span></button>
    </Dialog>}

    {deleting && <Dialog title={`Delete ${deleting.title}?`} onClose={() => setDeleting(null)} actions={<>
      <button className={ui.outline} onClick={() => setDeleting(null)}>Cancel</button>
      <button className={ui.danger} onClick={() => { setCourses(l => l.filter(c => c.id !== deleting.id)); toast('Course deleted'); setDeleting(null); }}>Delete</button>
    </>}><p style={{color: 'var(--muted)', margin: 0}}>Learners lose access and this cannot be undone.</p></Dialog>}
    {node}
  </>;
}
