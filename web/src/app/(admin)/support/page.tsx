'use client';

import {useState} from 'react';
import {Badge, Chips, Empty, Search, useToast} from '@/components/ui';
import ui from '@/components/ui.module.css';
import {tickets as seed, type Ticket} from '@/lib/data';
import s from '../list.module.css';

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(seed);
  const [filter, setFilter] = useState<'Open' | 'Solved' | 'All'>('Open');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(seed[0]?.id ?? null);
  const [reply, setReply] = useState('');
  const {toast, node} = useToast();
  const q = query.trim().toLowerCase();
  const shown = tickets.filter(t => (filter === 'All' || t.open === (filter === 'Open')) && (!q || t.title.toLowerCase().includes(q) || t.who.toLowerCase().includes(q)));
  const ticket = tickets.find(t => t.id === openId);
  const send = () => { if (!ticket || !reply.trim()) return; setTickets(l => l.map(t => (t.id === ticket.id ? {...t, messages: [...t.messages, {me: true, text: reply.trim()}]} : t))); setReply(''); };
  const solve = () => { if (!ticket) return; if (reply.trim()) send(); setTickets(l => l.map(t => (t.id === ticket.id ? {...t, open: false} : t))); toast('Marked solved'); };

  return <>
    <div className={s.tools}><Search value={query} onChange={setQuery} placeholder="Search tickets" /><Chips items={['Open', 'Solved', 'All'] as const} active={filter} onSelect={setFilter} /></div>
    <div className={s.split}>
      <div className={`${ui.card} ${s.panel}`}>
        {shown.length ? shown.map(t => <button key={t.id} className={`${ui.row} ${t.id === openId ? s.selected : ''}`} onClick={() => setOpenId(t.id)} aria-current={t.id === openId}>
          <span className={ui.rowIcon}>✉</span><span className={ui.rowCopy}><strong>{t.title}</strong><span>{t.who}</span></span><Badge label={t.open ? 'Open' : 'Solved'} tone={t.open ? 'gold' : 'green'} />
        </button>) : <Empty title={filter === 'Open' ? 'No open tickets' : 'No tickets found'} message={filter === 'Open' ? 'Everyone has an answer. Nice work.' : 'Try another search.'} />}
      </div>
      <div className={`${ui.card} ${s.thread}`}>
        {ticket ? <>
          <strong style={{fontSize: 18}}>{ticket.title}</strong>
          {ticket.messages.map((m, i) => <div key={i} className={m.me ? s.mine : s.theirs}>{m.text}</div>)}
          {ticket.open ? <div className={s.composer}>
            <textarea className={ui.input} placeholder="Write a reply" value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }} aria-label="Reply" />
            <div className={s.actions}><button className={ui.button} disabled={!reply.trim()} onClick={send}>Reply</button><button className={ui.outline} onClick={solve}>Mark solved</button></div>
          </div> : <Badge label="Solved" tone="green" />}
        </> : <Empty title="Pick a ticket" message="Its conversation shows here." />}
      </div>
    </div>
    {node}
  </>;
}
