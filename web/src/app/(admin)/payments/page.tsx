'use client';

import {useState} from 'react';
import {Avatar, Badge, Chips, Dialog, Empty, Search, useToast} from '@/components/ui';
import ui from '@/components/ui.module.css';
import {payments as seed, promos as seedPromos, type Payment, type Promo} from '@/lib/data';
import s from '../list.module.css';

const tabs = ['Transactions', 'Promo codes', 'Receipts'] as const;
const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(seed);
  const [promos, setPromos] = useState<Promo[]>(seedPromos);
  const [tab, setTab] = useState<(typeof tabs)[number]>('Transactions');
  const [query, setQuery] = useState('');
  const [refunding, setRefunding] = useState<Payment | null>(null);
  const [newCode, setNewCode] = useState<string | null>(null);
  const {toast, node} = useToast();
  const q = query.trim().toLowerCase();
  const list = payments.filter(p => (tab !== 'Receipts' || p.status === 'Paid') && (!q || p.name.toLowerCase().includes(q) || p.detail.toLowerCase().includes(q)));

  return <>
    <div className={s.tools}>
      {tab !== 'Promo codes' && <Search value={query} onChange={setQuery} placeholder="Search payments" />}
      <Chips items={tabs} active={tab} onSelect={setTab} />
      <span className={s.spacer} />
      {tab === 'Promo codes' && <button className={ui.button} onClick={() => setNewCode('')}>+ New code</button>}
    </div>
    <div className={`${ui.card} ${s.panel}`}>
      {tab === 'Promo codes' ? <table className={ui.table}>
        <thead><tr><th>Code</th><th>Details</th><th>Status</th></tr></thead>
        <tbody>{promos.map((p, i) => <tr key={p.code} className="rise" style={{animationDelay: `${i * 40}ms`}}><td><strong>{p.code}</strong></td><td>{p.detail}</td><td><Badge label={p.active ? 'Active' : 'Expired'} tone={p.active ? 'green' : 'grey'} /></td></tr>)}</tbody>
      </table> : list.length ? <table className={ui.table}>
        <thead><tr><th>Learner</th><th>Date</th><th>Status</th><th className={s.right}>Amount</th><th /></tr></thead>
        <tbody>{list.map((p, i) => <tr key={p.id} className="rise" style={{animationDelay: `${i * 40}ms`}}>
          <td><div className={ui.who}><Avatar name={p.name} /><div><strong>{p.name}</strong><span>{p.detail}</span></div></div></td>
          <td>{p.date}</td>
          <td><Badge label={p.status} tone={p.status === 'Paid' ? 'green' : p.status === 'Pending' ? 'gold' : 'grey'} /></td>
          <td className={s.right}><strong>{naira(p.amount)}</strong></td>
          <td className={s.right}>{tab === 'Receipts' ? <button className={ui.link} onClick={() => toast(`Receipt for ${p.name} copied`)}>Receipt</button> : p.status !== 'Refunded' && <button className={ui.link} style={{color: 'var(--danger)'}} onClick={() => setRefunding(p)}>Refund</button>}</td>
        </tr>)}</tbody>
      </table> : <Empty title="No payments found" message="Try another name or course." />}
    </div>

    {refunding && <Dialog title={`Refund ${naira(refunding.amount)}`} onClose={() => setRefunding(null)} actions={<>
      <button className={ui.outline} onClick={() => setRefunding(null)}>Cancel</button>
      <button className={ui.danger} onClick={() => { setPayments(l => l.map(p => (p.id === refunding.id ? {...p, status: 'Refunded', detail: 'Refunded'} : p))); toast(`${refunding.name} was refunded`); setRefunding(null); }}>Refund</button>
    </>}>
      <div className={ui.card} style={{padding: 14, background: 'var(--sand)', border: 0}}><strong>{refunding.name}</strong><div style={{color: 'var(--muted)', fontSize: 13, marginTop: 4}}>{refunding.detail}, paid {refunding.date}</div></div>
      <p style={{color: 'var(--muted)', fontSize: 13}}>The learner loses access to the course once the refund goes through.</p>
    </Dialog>}

    {newCode !== null && <Dialog title="New promo code" onClose={() => setNewCode(null)} actions={<>
      <button className={ui.outline} onClick={() => setNewCode(null)}>Cancel</button>
      <button className={ui.button} disabled={!/^[A-Z0-9]{3,}$/.test(newCode)} onClick={() => { setPromos(l => [{code: newCode, detail: 'New, 0 uses', active: true}, ...l]); toast(`${newCode} is live`); setNewCode(null); }}>Create</button>
    </>}>
      <label className={ui.label} htmlFor="code">Code</label>
      <input id="code" className={ui.input} autoFocus placeholder="SPRING15" value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} />
    </Dialog>}
    {node}
  </>;
}
