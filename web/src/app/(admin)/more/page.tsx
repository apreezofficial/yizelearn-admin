'use client';

import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Icon, type IconName} from '@/components/Icon';
import {Badge} from '@/components/ui';
import ui from '@/components/ui.module.css';
import {signOut} from '@/lib/auth';
import {privacyRequests, tickets} from '@/lib/data';

// The phone "More" tab: everything that doesn't fit in the bottom bar.
const items: {href: string; title: string; detail: string; icon: IconName; count?: number}[] = [
  {href: '/support', title: 'Support tickets', detail: 'Questions from learners', icon: 'support', count: tickets.filter(t => t.open).length},
  {href: '/settings?tab=Announcement', title: 'Platform announcement', detail: 'Message every user', icon: 'announce'},
  {href: '/settings?tab=Categories', title: 'Categories and tags', detail: 'How courses are grouped', icon: 'grid'},
  {href: '/payments', title: 'Promo codes', detail: 'Discounts at checkout', icon: 'tag'},
  {href: '/settings?tab=Instructor%20role', title: 'Instructor role', detail: 'What instructors can do', icon: 'role'},
  {href: '/settings?tab=Integrations', title: 'Integrations', detail: 'SSO, Zoom, email and more', icon: 'settings'},
  {href: '/settings?tab=Privacy', title: 'Privacy requests', detail: 'Exports and deletions', icon: 'lock', count: privacyRequests.filter(r => r.open).length},
  {href: '/settings?tab=Audit%20log', title: 'Audit log', detail: 'Who changed what', icon: 'file'},
];

export default function MorePage() {
  const router = useRouter();
  return <div className={ui.card} style={{padding: '4px 12px'}}>
    {items.map((m, i) => <Link key={m.href + m.title} href={m.href} className={`${ui.row} rise`} style={{animationDelay: `${i * 35}ms`}}>
      <span className={ui.rowIcon}><Icon name={m.icon} size={18} /></span>
      <span className={ui.rowCopy}><strong>{m.title}</strong><span>{m.detail}</span></span>
      {!!m.count && <Badge label={`${m.count} open`} tone="gold" />}
      <Icon name="next" size={18} className={ui.chev} />
    </Link>)}
    <button className={ui.row} onClick={() => { signOut(); router.replace('/login'); router.refresh(); }}>
      <span className={ui.rowIcon} style={{background: 'var(--danger-soft)', color: 'var(--danger)'}}><Icon name="logout" size={18} /></span>
      <span className={ui.rowCopy}><strong style={{color: 'var(--danger)'}}>Log out</strong></span>
    </button>
  </div>;
}
