'use client';

import {printDocument} from '@/lib/download';
import d from '@/components/learning.module.css';
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
  const [selected, setSelected] = useState<Payment | null>(null);
  const [receipt, setReceipt] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);
  const {toast, node} = useToast();
  const q = query.trim().toLowerCase();
  const list = payments.filter(p => (tab !== 'Receipts' || p.status === 'Paid') && (!q || p.name.toLowerCase().includes(q) || p.detail.toLowerCase().includes(q)));

  const detail = selected ? payments.find(p => p.id === selected.id) ?? selected : null;
  const order = detail ? `#${10482 - payments.findIndex(p => p.id === detail.id)}` : '';
  return <>
    {detail ? <div className={d.narrow}><button className={ui.link} onClick={() => { if (receipt && tab !== 'Receipts') setReceipt(false); else setSelected(null); }}>← Back</button><h2>{receipt ? `Receipt ${order}` : 'Transaction'}</h2><div className={d.summary}><span className={d.muted}>{detail.name}, {receipt ? `${detail.date} 2026` : detail.status.toLowerCase()}</span><h2>{naira(detail.amount)}</h2></div>{[['Course', detail.detail.startsWith('Excel') ? 'Data analysis in Excel' : detail.detail.split(',')[0]], ...(receipt ? [['Tax', '₦0.00'], ['Total', naira(detail.amount)]] : [['Date', `${detail.date} 2026`], ['Method', detail.detail.includes('card') ? 'Card ending 4417' : 'Bank transfer'], ['Status', detail.status], ['Order', order]])].map(([k,v]) => <div key={k} className={ui.row}><span className={ui.rowCopy}>{k}</span><strong>{v}</strong></div>)}<div className={d.actions}>{receipt ? <><button className={ui.outline} onClick={() => { if (!printDocument(`Receipt ${order}`, [['Learner', detail.name], ['Amount', naira(detail.amount)], ['Date', `${detail.date} 2026`], ['Course', detail.detail]])) toast('Allow popups to save the receipt as PDF.'); }}>Download PDF</button><button className={ui.button} onClick={() => toast('Resending requires the admin messaging API.')}>Resend to learner</button></> : <><button className={ui.outline} disabled={detail.status !== 'Paid'} onClick={() => setReceipt(true)}>View receipt</button><button className={ui.button} disabled={detail.status === 'Refunded'} onClick={() => setRefunding(detail)}>Refund payment</button></>}</div></div> : <>
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
          <td className={s.right}><button className={ui.link} onClick={() => { setSelected(p); setReceipt(tab === 'Receipts'); }}>{tab === 'Receipts' ? 'Receipt' : 'View details'}</button></td>
        </tr>)}</tbody>
      </table> : <Empty title="No payments found" message="Try another name or course." />}
    </div>

    </>}
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
