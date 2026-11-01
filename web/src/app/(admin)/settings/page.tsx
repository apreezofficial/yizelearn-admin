'use client';

import {useSearchParams} from 'next/navigation';
import {Suspense, useState} from 'react';
import {Badge, Chips, Dialog, Empty, Search, Switch, useToast} from '@/components/ui';
import {Icon} from '@/components/Icon';
import ui from '@/components/ui.module.css';
import {auditLog, categories, instructorCount, instructorPermissions, integrations as seedIntegrations, privacyRequests as seedPrivacy, tags, type Integration, type PrivacyRequest} from '@/lib/data';
import s from '../list.module.css';

const tabs = ['Instructor role', 'Categories', 'Integrations', 'Announcement', 'Privacy', 'Audit log'] as const;
type Tab = (typeof tabs)[number];

export default function SettingsPage() {
  return <Suspense><SettingsFromUrl /></Suspense>;
}

// Remount when the ?tab= link changes, so the bell and More links switch tabs even from this page.
function SettingsFromUrl() {
  const initial = useSearchParams().get('tab') as Tab | null;
  return <Settings key={initial ?? ''} initial={initial} />;
}

function Settings({initial}: {initial: Tab | null}) {
  const [tab, setTab] = useState<Tab>(initial && tabs.includes(initial) ? initial : 'Instructor role');
  const {toast, node} = useToast();
  return <>
    <div className={s.tools}><Chips items={tabs} active={tab} onSelect={setTab} /></div>
    <div key={tab} className="rise">
      {tab === 'Instructor role' && <Role toast={toast} />}
      {tab === 'Categories' && <Categories />}
      {tab === 'Integrations' && <Integrations toast={toast} />}
      {tab === 'Announcement' && <Announcement toast={toast} />}
      {tab === 'Privacy' && <Privacy toast={toast} />}
      {tab === 'Audit log' && <Audit />}
    </div>
    {node}
  </>;
}

type Toast = {toast: (msg: string) => void};

function Role({toast}: Toast) {
  const [saved, setSaved] = useState(() => Object.fromEntries(instructorPermissions.map(p => [p.key, p.on])) as Record<string, boolean>);
  const [perms, setPerms] = useState(saved);
  const changed = instructorPermissions.some(p => perms[p.key] !== saved[p.key]);
  return <div className={`${ui.card} ${s.panel}`} style={{maxWidth: 560, padding: 18}}>
    <div className={ui.noticeInfo}>Changes apply to {instructorCount} instructors</div>
    {instructorPermissions.map(p => <div key={p.key} className={ui.row} style={{cursor: 'default'}}><span className={ui.rowCopy}><strong style={{fontWeight: 500}}>{p.label}</strong></span><Switch label={p.label} checked={perms[p.key]} onChange={v => setPerms(x => ({...x, [p.key]: v}))} /></div>)}
    <button className={ui.button} style={{width: '100%', marginTop: 18}} disabled={!changed} onClick={() => { setSaved(perms); toast('Saved'); }}>Save changes</button>
  </div>;
}

function Categories() {
  const [kind, setKind] = useState<'Categories' | 'Tags'>('Categories');
  const [list, setList] = useState({Categories: categories, Tags: tags});
  const [name, setName] = useState('');
  const add = () => { if (!name.trim()) return; setList(l => ({...l, [kind]: [...l[kind], {name: name.trim(), count: 0}]})); setName(''); };
  return <div className={`${ui.card} ${s.panel}`} style={{maxWidth: 640, padding: 18}}>
    <Chips items={['Categories', 'Tags'] as const} active={kind} onSelect={setKind} />
    {list[kind].map(c => <div key={c.name} className={ui.row} style={{cursor: 'default'}}><span className={ui.rowIcon}><Icon name="grid" size={18} /></span><span className={ui.rowCopy}><strong>{c.name}</strong><span>{c.count} courses</span></span></div>)}
    <form className={s.actions} style={{marginTop: 14}} onSubmit={e => { e.preventDefault(); add(); }}>
      <input className={ui.input} placeholder={`New ${kind === 'Tags' ? 'tag' : 'category'}`} value={name} onChange={e => setName(e.target.value)} />
      <button className={ui.button} style={{flex: 'none'}} disabled={!name.trim()}>Add</button>
    </form>
  </div>;
}

function Integrations({toast}: Toast) {
  const [list, setList] = useState<Integration[]>(seedIntegrations);
  const [editing, setEditing] = useState<Integration | null>(null);
  const [key, setKey] = useState('');
  const [secret, setSecret] = useState('');
  return <div className={`${ui.card} ${s.panel}`} style={{maxWidth: 640}}>
    {list.map(x => <button key={x.id} className={ui.row} onClick={() => { setEditing(x); setKey(''); setSecret(''); }}>
      <span className={ui.rowIcon}><Icon name="grid" size={18} /></span><span className={ui.rowCopy}><strong>{x.name}</strong></span><Badge label={x.connected ? 'Connected' : 'Not set up'} tone={x.connected ? 'green' : 'grey'} />
    </button>)}
    {editing && <Dialog title={editing.name} onClose={() => setEditing(null)} actions={<>
      <button className={ui.outline} onClick={() => setEditing(null)}>Cancel</button>
      <button className={ui.button} disabled={!key.trim() || !secret.trim()} onClick={() => { setList(l => l.map(i => (i.id === editing.id ? {...i, connected: true} : i))); toast(`${editing.name} connected`); setEditing(null); }}>{editing.connected ? 'Test and save' : 'Test and enable'}</button>
    </>}>
      <div className={ui.field}><label className={ui.label} htmlFor="key">API key</label><input id="key" className={ui.input} autoComplete="off" placeholder="Paste key" value={key} onChange={e => setKey(e.target.value)} /></div>
      <div className={ui.field}><label className={ui.label} htmlFor="secret">API secret</label><input id="secret" className={ui.input} type="password" autoComplete="off" placeholder="Paste secret" value={secret} onChange={e => setSecret(e.target.value)} /></div>
      <div className={ui.field}><label className={ui.label} htmlFor="acct">Account</label><select id="acct" className={ui.input}><option>Primary account</option><option>Training account</option></select></div>
    </Dialog>}
  </div>;
}

function Announcement({toast}: Toast) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [audience, setAudience] = useState('All users');
  const [when, setWhen] = useState('Now');
  return <div className={`${ui.card} ${s.panel}`} style={{maxWidth: 640, padding: 18}}>
    <div className={ui.field}><label className={ui.label} htmlFor="aud">Audience</label><select id="aud" className={ui.input} value={audience} onChange={e => setAudience(e.target.value)}><option>All users</option><option>Students</option><option>Instructors</option></select></div>
    <div className={ui.field}><label className={ui.label} htmlFor="atitle">Title</label><input id="atitle" className={ui.input} placeholder="Scheduled maintenance" value={title} onChange={e => setTitle(e.target.value)} /></div>
    <div className={ui.field}><label className={ui.label} htmlFor="amsg">Message</label><textarea id="amsg" className={ui.input} placeholder="Write your announcement" value={message} onChange={e => setMessage(e.target.value)} /></div>
    <div className={ui.field}><label className={ui.label} htmlFor="when">Send</label><select id="when" className={ui.input} value={when} onChange={e => setWhen(e.target.value)}><option>Now</option><option>Tomorrow 9 AM</option><option>Next Monday 9 AM</option></select></div>
    <button className={ui.button} style={{width: '100%'}} disabled={!title.trim() || !message.trim()} onClick={() => setConfirming(true)}>Publish announcement</button>
    {confirming && <Dialog title="Publish announcement?" onClose={() => setConfirming(false)} actions={<>
      <button className={ui.outline} onClick={() => setConfirming(false)}>Cancel</button>
      <button className={ui.button} onClick={() => { toast('Announcement published'); setTitle(''); setMessage(''); setConfirming(false); }}>Publish</button>
    </>}><p style={{color: 'var(--muted)', margin: 0}}>{audience} will get “{title.trim()}” {when === 'Now' ? 'now' : when}.</p></Dialog>}
  </div>;
}

function Privacy({toast}: Toast) {
  const [list, setList] = useState<PrivacyRequest[]>(seedPrivacy);
  const [filter, setFilter] = useState<'Open' | 'Done'>('Open');
  const [reviewing, setReviewing] = useState<PrivacyRequest | null>(null);
  const shown = list.filter(r => r.open === (filter === 'Open'));
  const deleting = reviewing?.kind === 'Delete account';
  return <div className={`${ui.card} ${s.panel}`} style={{maxWidth: 640, padding: 18}}>
    <Chips items={['Open', 'Done'] as const} active={filter} onSelect={setFilter} />
    {shown.map(r => <button key={r.id} className={ui.row} disabled={!r.open} onClick={() => setReviewing(r)}>
      <span className={ui.rowIcon}><Icon name="lock" size={18} /></span><span className={ui.rowCopy}><strong>{r.kind}</strong><span>{r.who}, {r.due}</span></span><Badge label={r.open ? 'Open' : 'Done'} tone={r.open ? 'gold' : 'green'} />
    </button>)}
    {!shown.length && <Empty title={filter === 'Open' ? 'No open requests' : 'Nothing done yet'} message="Data exports and deletions show up here." />}
    {reviewing && <Dialog title={reviewing.kind} onClose={() => setReviewing(null)} actions={<>
      <button className={ui.outline} onClick={() => setReviewing(null)}>Cancel</button>
      <button className={deleting ? ui.danger : ui.button} onClick={() => { setList(l => l.map(r => (r.id === reviewing.id ? {...r, open: false, due: 'completed'} : r))); toast(deleting ? 'Account deleted' : 'Export sent'); setReviewing(null); }}>{deleting ? 'Delete account' : 'Send export'}</button>
    </>}><p style={{color: 'var(--muted)', margin: 0}}>{reviewing.who}, {reviewing.due}. {deleting ? 'Their account and data will be removed for good.' : 'We will email them a copy of their data.'}</p></Dialog>}
  </div>;
}

function Audit() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Users' | 'Payments'>('All');
  const q = query.trim().toLowerCase();
  const shown = auditLog.filter(e => (filter === 'All' || e.kind === filter) && (!q || e.title.toLowerCase().includes(q) || e.who.toLowerCase().includes(q)));
  return <div className={`${ui.card} ${s.panel}`} style={{maxWidth: 760, padding: 18}}>
    <div className={s.tools}><Search value={query} onChange={setQuery} placeholder="Search log" /><Chips items={['All', 'Users', 'Payments'] as const} active={filter} onSelect={setFilter} /></div>
    {shown.map(e => <div key={e.id} className={ui.row} style={{cursor: 'default'}}><span className={ui.rowIcon}><Icon name="file" size={18} /></span><span className={ui.rowCopy}><strong>{e.title}</strong><span>{e.who}</span></span></div>)}
    {!shown.length && <Empty title="Nothing in the log" message="Try another search." />}
  </div>;
}
