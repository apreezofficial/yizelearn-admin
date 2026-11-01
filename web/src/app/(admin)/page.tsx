'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {courses, integrations, signups, stats, tickets} from '@/lib/data';
import {Icon} from '@/components/Icon';
import ui from '@/components/ui.module.css';
import s from './page.module.css';

export default function Dashboard() {
  const [shown, setShown] = useState(0);
  // Count the total up on load, unless the visitor prefers less motion.
  useEffect(() => {
    // With reduced motion the first frame jumps straight to the total.
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = duration ? Math.min(1, (now - start) / duration) : 1;
      setShown(Math.round(stats.users * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  const max = Math.max(...signups.map(d => d.v));
  const inReview = courses.filter(c => c.status === 'In review').length;
  const open = tickets.filter(t => t.open).length;
  const notSetUp = integrations.filter(i => !i.connected).length;

  return <>
    <section className={s.grid}>
      <div className={`${s.hero} rise`} aria-label={`Total users ${stats.users.toLocaleString()}`}>
        <span className={s.bubble} /><span className={s.bubbleSmall} />
        <small>Total users</small>
        <strong>{shown.toLocaleString()}</strong>
        <span className={s.pill}>+{stats.usersThisWeek} this week</span>
      </div>
      <Link href="/courses" className={`${ui.card} ${s.tile} rise`} style={{animationDelay: '60ms'}}>
        <div className={s.tileHead}>Courses</div>
        <div className={s.tileValue}><strong>{stats.courses}</strong><span>{stats.inReview} in review</span></div>
      </Link>
      <Link href="/support" className={`${ui.card} ${s.tile} rise`} style={{animationDelay: '120ms'}}>
        <div className={s.tileHead}>Open tickets</div>
        <div className={s.tileValue}><strong>{stats.tickets}</strong><span>{stats.urgent} urgent</span></div>
      </Link>
    </section>
    <section className={s.lower}>
      <div className={`${ui.card} ${s.chart} rise`} style={{animationDelay: '180ms'}} aria-label="Sign-ups over the last 7 days">
        <div className={s.chartHead}>Sign-ups <span>7 days</span></div>
        <div className={s.bars}>
          {signups.map((d, i) => <div key={i} className={s.barCol}>
            {d.v === max && <span className={s.peakLabel}>{d.v}</span>}
            <div className={`${s.bar} ${d.v === max ? s.peak : ''}`} style={{height: `${(d.v / max) * 120}px`, animationDelay: `${200 + i * 60}ms`}} title={`${d.v} sign-ups`} />
            <small>{d.d}</small>
          </div>)}
        </div>
      </div>
      <div className={`${ui.card} ${s.attention} rise`} style={{animationDelay: '240ms'}}>
        <h2>Needs attention <Link href="/courses?filter=In%20review" className={ui.link}>See all</Link></h2>
        {inReview > 0 && <Link href="/courses?filter=In%20review" className={ui.row}><span className={ui.rowIcon}><Icon name="courses" size={18} /></span><span className={ui.rowCopy}><strong>{inReview} {inReview === 1 ? 'course' : 'courses'} in review</strong><span>Oldest waiting 2 days</span></span><Icon name="next" size={18} className={ui.chev} /></Link>}
        {notSetUp > 0 && <Link href="/settings?tab=Integrations" className={ui.row}><span className={ui.rowIcon}><Icon name="payments" size={18} /></span><span className={ui.rowCopy}><strong>Payment gateway warning</strong><span>Check provider keys</span></span><Icon name="next" size={18} className={ui.chev} /></Link>}
        {open > 0 && <Link href="/support" className={ui.row}><span className={ui.rowIcon}><Icon name="support" size={18} /></span><span className={ui.rowCopy}><strong>{open} open support tickets</strong><span>Reply within a day</span></span><Icon name="next" size={18} className={ui.chev} /></Link>}
      </div>
    </section>
  </>;
}
