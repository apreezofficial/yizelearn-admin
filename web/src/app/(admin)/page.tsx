'use client';

import Link from 'next/link';
import {useState} from 'react';
import {courses, integrations, signups, stats, tickets} from '@/lib/data';
import {Icon, type IconName} from '@/components/Icon';
import {useCountUp} from '@/components/motion';
import ui from '@/components/ui.module.css';
import s from './page.module.css';

// Sample week shapes for the tile sparklines until the API sends real history.
const courseTrend = [290, 294, 298, 301, 305, 309, 312];
const ticketTrend = [22, 19, 21, 17, 18, 15, 14];

export default function Dashboard() {
  const users = useCountUp(stats.users, {duration: 1200});
  const thisWeek = useCountUp(stats.usersThisWeek, {delay: 500});
  const students = useCountUp(stats.students, {duration: 1200, delay: 250});
  const instructors = useCountUp(stats.instructors, {delay: 350});
  const admins = useCountUp(stats.admins, {delay: 450});
  const growth = Math.round(((stats.usersThisWeek - stats.usersLastWeek) / stats.usersLastWeek) * 100);
  const inReview = courses.filter(c => c.status === 'In review').length;
  const open = tickets.filter(t => t.open).length;
  const notSetUp = integrations.filter(i => !i.connected).length;
  const attention: {href: string; icon: IconName; title: string; detail: string}[] = [
    ...(inReview ? [{href: '/courses?filter=In%20review', icon: 'courses' as const, title: `${inReview} ${inReview === 1 ? 'course' : 'courses'} in review`, detail: 'Oldest waiting 2 days'}] : []),
    ...(notSetUp ? [{href: '/settings?tab=Integrations', icon: 'payments' as const, title: 'Payment gateway warning', detail: 'Check provider keys'}] : []),
    ...(open ? [{href: '/support', icon: 'support' as const, title: `${open} open support tickets`, detail: 'Reply within a day'}] : []),
  ];

  return <>
    <section className={s.grid}>
      <div className={`${s.hero} rise`} aria-label={`Total users ${stats.users.toLocaleString()}, ${stats.usersThisWeek} new this week`}>
        <span className={s.glow} aria-hidden /><span className={s.dots} aria-hidden /><span className={s.shine} aria-hidden />
        <span className={s.ring} aria-hidden /><span className={s.bubble} aria-hidden /><span className={s.bubbleSmall} aria-hidden /><span className={s.goldDot} aria-hidden />
        <div className={s.heroLabel}><span className={s.heroIcon}><Icon name="users" size={15} /></span>Total users</div>
        <strong>{users.toLocaleString()}</strong>
        <div className={s.heroMeta}>
          <span className={s.pill}>+{thisWeek} this week</span>
          <span className={s.vs}>{growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}% vs last week</span>
        </div>
        <div className={s.split}>
          <span><b>{students.toLocaleString()}</b>Students</span>
          <span><b>{instructors.toLocaleString()}</b>Instructors</span>
          <span><b>{admins}</b>Admins</span>
        </div>
      </div>
      <Tile href="/courses" icon="courses" label="Courses" value={stats.courses} note={`${stats.inReview} in review`} trend={courseTrend} delay={80} />
      <Tile href="/support" icon="support" label="Open tickets" value={stats.tickets} note={`${stats.urgent} urgent`} trend={ticketTrend} delay={160} />
    </section>
    <section className={s.lower}>
      <SignupChart />
      <div className={`${ui.card} ${s.attention} rise`} style={{animationDelay: '260ms'}}>
        <h2>Needs attention <Link href="/courses?filter=In%20review" className={ui.link}>See all</Link></h2>
        {attention.map((a, i) => <Link key={a.href} href={a.href} className={`${ui.row} ${s.slide}`} style={{animationDelay: `${420 + i * 90}ms`}}>
          <span className={ui.rowIcon}><Icon name={a.icon} size={18} /></span>
          <span className={ui.rowCopy}><strong>{a.title}</strong><span>{a.detail}</span></span>
          <Icon name="next" size={18} className={ui.chev} />
        </Link>)}
      </div>
    </section>
  </>;
}

function Tile({href, icon, label, value, note, trend, delay}: {href: string; icon: IconName; label: string; value: number; note: string; trend: number[]; delay: number}) {
  const shown = useCountUp(value, {delay: delay + 200});
  const min = Math.min(...trend), max = Math.max(...trend);
  const points = trend.map((v, i) => `${(i / (trend.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 24}`).join(' ');
  return <Link href={href} className={`${ui.card} ${s.tile} rise`} style={{animationDelay: `${delay}ms`}}>
    <div className={s.tileHead}><span className={s.tileIcon}><Icon name={icon} size={16} /></span>{label}</div>
    <svg className={s.spark} viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden>
      <polyline points={points} style={{animationDelay: `${delay + 300}ms`}} />
    </svg>
    <div className={s.tileValue}><strong>{shown}</strong><span>{note}</span></div>
  </Link>;
}

/** Bars grow in one after another, then a trend line flows across their tops and the busiest day pops its label. */
function SignupChart() {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...signups.map(d => d.v));
  const peak = signups.findIndex(d => d.v === max);
  const total = useCountUp(signups.reduce((n, d) => n + d.v, 0), {delay: 300});
  const H = 120;
  const line = signups.map((d, i) => `${((i + 0.5) / signups.length) * 100},${H - (d.v / max) * H + 4}`).join(' ');
  const shown = hover ?? peak;
  return <div className={`${ui.card} ${s.chart} rise`} style={{animationDelay: '200ms'}}>
    <div className={s.chartHead}><span>Sign-ups <b className={s.total}>{total}</b></span><span>7 days</span></div>
    <div className={s.plot} onMouseLeave={() => setHover(null)} role="img" aria-label={`Sign-ups over 7 days, ${signups.map(d => `${d.d} ${d.v}`).join(', ')}`}>
      <div className={s.bars}>
        {signups.map((d, i) => <div key={i} className={s.barCol} onMouseEnter={() => setHover(i)}>
          {i === shown && <span key={`l${i}`} className={s.peakLabel} style={{animationDelay: hover === null ? '1000ms' : '0ms'}}>{d.v}</span>}
          <div className={`${s.bar} ${i === peak ? s.peak : ''} ${hover === i ? s.barHover : ''}`} style={{height: `${(d.v / max) * H}px`, animationDelay: `${300 + i * 70}ms`}} />
          <small>{d.d}</small>
        </div>)}
      </div>
      <svg className={s.trend} viewBox={`0 0 100 ${H + 8}`} preserveAspectRatio="none" aria-hidden>
        <polyline points={line} />
      </svg>
    </div>
  </div>;
}
