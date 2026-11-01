'use client';

import Image from 'next/image';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useState} from 'react';
import {Avatar} from '@/components/ui';
import {signOut} from '@/lib/auth';
import s from './shell.module.css';

const nav = [
  {href: '/', label: 'Dashboard', icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'},
  {href: '/users', label: 'Users', icon: 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M22 19v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8'},
  {href: '/courses', label: 'Courses', icon: 'M4 5h16v10H4zM2 19h20'},
  {href: '/payments', label: 'Payments', icon: 'M3 6h18v12H3zM3 10h18'},
  {href: '/support', label: 'Support', icon: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12'},
  {href: '/settings', label: 'Settings', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 3V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 10h.1a2 2 0 1 1 0 4z'},
];

export default function AdminLayout({children}: {children: React.ReactNode}) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const logout = () => { signOut(); router.replace('/login'); router.refresh(); };
  const title = nav.find(n => (n.href === '/' ? path === '/' : path.startsWith(n.href)))?.label ?? 'Admin';
  return <div className={s.shell}>
    <aside className={`${s.side} ${open ? s.sideOpen : ''}`}>
      <Image src="/logo.png" alt="yizelearn" width={110} height={40} className={s.logo} />
      <nav className={s.nav} aria-label="Admin">
        {nav.map(n => {
          const on = n.href === '/' ? path === '/' : path.startsWith(n.href);
          return <Link key={n.href} href={n.href} className={on ? s.linkOn : s.link} aria-current={on ? 'page' : undefined} onClick={() => setOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={n.icon} /></svg>
            {n.label}
          </Link>;
        })}
      </nav>
      <button className={s.logout} onClick={logout}>Log out</button>
    </aside>
    {open && <div className={s.scrim} onClick={() => setOpen(false)} />}
    <div className={s.main}>
      <header className={s.top}>
        <button className={s.menu} onClick={() => setOpen(o => !o)} aria-label="Menu" aria-expanded={open}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <div><h1 className={s.title}>{title}</h1><span className={s.underline} /></div>
        <div className={s.topRight}>
          <Link href="/settings?tab=Audit%20log" className={s.bell} aria-label="Activity, new">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" /></svg>
            <span className={s.dot} />
          </Link>
          <Avatar name="Sam Admin" size={34} />
        </div>
      </header>
      <main className={s.content} key={path}>{children}</main>
    </div>
  </div>;
}
