'use client';

import {useState} from 'react';
import {Avatar, Badge, Chips, Dialog, Empty, Search, useToast} from '@/components/ui';
import ui from '@/components/ui.module.css';
import {roles, roleTone, users as seed, type Role, type User} from '@/lib/data';
import s from '../list.module.css';

const filters = ['All', 'Students', 'Instructors', 'Admins'] as const;
const filterRole: Record<(typeof filters)[number], Role[] | null> = {All: null, Students: ['Student'], Instructors: ['Instructor'], Admins: ['Admin', 'Manager']};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(seed);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [picked, setPicked] = useState<string[]>([]);
  const [open, setOpen] = useState<User | null>(null);
  const [inviting, setInviting] = useState(false);
  const [roleFor, setRoleFor] = useState<string[] | null>(null);
  const {toast, node} = useToast();
  const q = query.trim().toLowerCase();
  const shown = users.filter(u => (!filterRole[filter] || filterRole[filter]!.includes(u.role)) && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  const toggle = (id: string) => setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]));
  const update = (ids: string[], change: Partial<User>) => setUsers(list => list.map(u => (ids.includes(u.id) ? {...u, ...change} : u)));

  return <>
    <div className={s.tools}>
      <Search value={query} onChange={setQuery} placeholder="Search users" />
      <Chips items={filters} active={filter} onSelect={setFilter} />
      <span className={s.spacer} />
      <button className={ui.button} onClick={() => setInviting(true)}>+ Invite user</button>
    </div>
    {picked.length > 0 && <div className={s.bulk}>
      {picked.length} selected
      <span className={s.spacer} />
      <button className={ui.link} onClick={() => setPicked(picked.length === users.length ? [] : users.map(u => u.id))}>{picked.length === users.length ? 'Clear all' : 'Select all'}</button>
      <button className={ui.outline} onClick={() => setRoleFor(picked)}>Change role</button>
      <button className={ui.danger} onClick={() => { update(picked, {suspended: true}); toast(`${picked.length} accounts suspended`); setPicked([]); }}>Suspend</button>
    </div>}
    <div className={`${ui.card} ${s.panel}`}>
      {shown.length ? <table className={ui.table}>
        <thead><tr><th style={{width: 30}} aria-label="Select" /><th>User</th><th>Role</th><th>Courses</th><th>Joined</th></tr></thead>
        <tbody>{shown.map((u, i) => <tr key={u.id} className={`${ui.clickable} ${picked.includes(u.id) ? s.selected : ''} rise`} style={{animationDelay: `${i * 40}ms`}} onClick={() => setOpen(u)}>
          <td onClick={e => e.stopPropagation()}><input type="checkbox" className={s.check} checked={picked.includes(u.id)} onChange={() => toggle(u.id)} aria-label={`Select ${u.name}`} /></td>
          <td><div className={ui.who}><Avatar name={u.name} /><div><strong>{u.name}</strong><span>{u.suspended ? 'Suspended' : u.email}</span></div></div></td>
          <td><Badge label={u.role} tone={u.suspended ? 'red' : roleTone[u.role]} /></td>
          <td>{u.courses}</td>
          <td>{u.joined}</td>
        </tr>)}</tbody>
      </table> : <Empty title="No users found" message="Try another name or email." />}
    </div>

    {open && <Dialog title={open.name} onClose={() => setOpen(null)} actions={<>
      <button className={ui.outline} onClick={() => { setRoleFor([open.id]); setOpen(null); }}>Change role</button>
      <button className={open.suspended ? ui.button : ui.danger} onClick={() => { update([open.id], {suspended: !open.suspended}); toast(open.suspended ? `${open.name} restored` : `${open.name} suspended`); setOpen(null); }}>{open.suspended ? 'Restore' : 'Suspend'}</button>
    </>}>
      <div className={ui.who} style={{marginBottom: 14}}><Avatar name={open.name} size={56} /><div><strong>{open.role}</strong><span>{open.lastSeen}</span></div></div>
      <table className={ui.table}><tbody>
        <tr><td>Email</td><td className={s.right}><strong>{open.email}</strong></td></tr>
        <tr><td>Courses</td><td className={s.right}><strong>{open.courses}</strong></td></tr>
        <tr><td>Joined</td><td className={s.right}><strong>{open.joined}</strong></td></tr>
      </tbody></table>
      <button className={ui.link} style={{marginTop: 14}} onClick={() => { toast(`${open.name} was signed out of all devices`); setOpen(null); }}>Sign out of all devices</button>
    </Dialog>}

    {roleFor && <Dialog title="Change role" onClose={() => setRoleFor(null)} actions={<button className={ui.outline} onClick={() => setRoleFor(null)}>Cancel</button>}>
      {roles.map(r => <button key={r} className={ui.row} onClick={() => { update(roleFor, {role: r}); toast(`${roleFor.length} ${roleFor.length === 1 ? 'user is' : 'users are'} now ${r}`); setRoleFor(null); setPicked([]); }}><span className={ui.rowCopy}><strong>{r}</strong></span></button>)}
    </Dialog>}

    {inviting && <InviteDialog onClose={() => setInviting(false)} onInvite={(email, role) => {
      setUsers(list => [...list, {id: email, name: email.split('@')[0], email, role, courses: 0, joined: 'Invited', lastSeen: 'invite sent'}]);
      toast(`Invite sent to ${email}`);
      setInviting(false);
    }} />}
    {node}
  </>;
}

function InviteDialog({onClose, onInvite}: {onClose: () => void; onInvite: (email: string, role: Role) => void}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Student');
  const [note, setNote] = useState('');
  const valid = EMAIL.test(email.trim());
  return <Dialog title="Invite user" onClose={onClose} actions={<>
    <button className={ui.outline} onClick={onClose}>Cancel</button>
    <button className={ui.button} disabled={!valid} onClick={() => onInvite(email.trim(), role)}>Send invite</button>
  </>}>
    <div className={ui.field}><label className={ui.label} htmlFor="invite-email">Email address</label><input id="invite-email" className={ui.input} type="email" autoFocus placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
    <div className={ui.field}><label className={ui.label} htmlFor="invite-role">Role</label><select id="invite-role" className={ui.input} value={role} onChange={e => setRole(e.target.value as Role)}>{roles.map(r => <option key={r}>{r}</option>)}</select></div>
    <div className={ui.field}><label className={ui.label} htmlFor="invite-note">Message (optional)</label><textarea id="invite-note" className={ui.input} placeholder="Add a short note" value={note} onChange={e => setNote(e.target.value)} /></div>
  </Dialog>;
}
