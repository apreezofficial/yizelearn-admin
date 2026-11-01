'use client';

import Image from 'next/image';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {Icon, type IconName} from '@/components/Icon';
import {Avatar} from '@/components/ui';
import {signOut} from '@/lib/auth';
import s from './shell.module.css';

type Item = {href: string; label: string; icon: IconName};
// Sidebar on wide screens. Phones get the five tabs from the mobile design, with Support and Settings under More.
const side: Item[] = [
  {href: '/', label: 'Dashboard', icon: 'dashboard'},
  {href: '/users', label: 'Users', icon: 'users'},
  {href: '/courses', label: 'Courses', icon: 'courses'},
  {href: '/payments', label: 'Payments', icon: 'payments'},
  {href: '/support', label: 'Support', icon: 'support'},
  {href: '/settings', label: 'Settings', icon: 'settings'},
];
const tabs: Item[] = [...side.slice(0, 4), {href: '/more', label: 'More', icon: 'more'}];
const isOn = (path: string, href: string) => (href === '/' ? path === '/' : path.startsWith(href));
const titles: Record<string, string> = {'/more': 'More'};

export default function AdminLayout({children}: {children: React.ReactNode}) {
  const path = usePathname();
  const router = useRouter();
  const logout = () => { signOut(); router.replace('/login'); router.refresh(); };
  const title = titles[path] ?? side.find(n => isOn(path, n.href))?.label ?? 'Admin';
  // Support and Settings sit under More on phones, so that tab stays lit for them.
  const tabOn = (href: string) => (href === '/more' ? ['/more', '/support', '/settings'].some(p => path.startsWith(p)) : isOn(path, href));

  return <div className={s.shell}>
    <aside className={s.side}>
      <Image src="/logo.png" alt="yizelearn" width={110} height={40} className={s.logo} />
      <nav className={s.nav} aria-label="Admin">
        {side.map(n => <Link key={n.href} href={n.href} className={isOn(path, n.href) ? s.linkOn : s.link} aria-current={isOn(path, n.href) ? 'page' : undefined}>
          <Icon name={n.icon} size={20} />{n.label}
        </Link>)}
      </nav>
      <button className={s.logout} onClick={logout}><Icon name="logout" size={20} />Log out</button>
    </aside>

    <div className={s.main}>
      <header className={s.top}>
        <div><h1 className={s.title}>{title}</h1><span className={s.underline} /></div>
        <div className={s.topRight}>
          <Link href="/settings?tab=Audit%20log" className={s.bell} aria-label="Activity, new">
            <Icon name="bell" size={22} />
            <span className={s.dot} />
          </Link>
          <Avatar name="Sam Admin" size={34} />
        </div>
      </header>
      <main className={s.content} key={path}>{children}</main>
    </div>

    <nav className={s.tabs} aria-label="Admin tabs">
      {tabs.map(t => <Link key={t.href} href={t.href} className={tabOn(t.href) ? s.tabOn : s.tab} aria-current={tabOn(t.href) ? 'page' : undefined}>
        <span className={s.tabIcon}><Icon name={t.icon} size={22} strokeWidth={tabOn(t.href) ? 2 : 1.6} /></span>
        {t.label}
      </Link>)}
    </nav>
  </div>;
}
