'use client';
import Link from 'next/link';
import { Icon, type IconName } from '@/components/Icon';
import s from './more.module.css';
const groups: {
  title: string;
  items: { href: string; title: string; icon: IconName; fresh?: boolean }[];
}[] = [
  {
    title: 'Learning',
    items: [
      { href: '/cohorts', title: 'Cohorts', icon: 'users', fresh: true },
      { href: '/at-risk', title: 'At risk', icon: 'alert', fresh: true },
      {
        href: '/certificates',
        title: 'Certificates',
        icon: 'award',
        fresh: true,
      },
      { href: '/reports', title: 'Reports', icon: 'chart', fresh: true },
    ],
  },
  {
    title: 'Platform',
    items: [
      { href: '/settings?tab=Instructor%20role', title: 'Roles', icon: 'role' },
      {
        href: '/settings?tab=Integrations',
        title: 'Integrations',
        icon: 'grid',
      },
      { href: '/settings?tab=Audit%20log', title: 'Audit log', icon: 'file' },
      { href: '/settings?tab=Privacy', title: 'Privacy', icon: 'lock' },
    ],
  },
  {
    title: 'Communicate',
    items: [
      {
        href: '/settings?tab=Announcement',
        title: 'Announcements',
        icon: 'bell',
      },
      { href: '/support', title: 'Support', icon: 'support' },
    ],
  },
  {
    title: 'Setup',
    items: [
      {
        href: '/settings?tab=Categories',
        title: 'Categories',
        icon: 'courses',
      },
      { href: '/bulk-enrol', title: 'Bulk enrol', icon: 'upload' },
      { href: '/profile', title: 'Settings', icon: 'settings' },
    ],
  },
];
export default function MorePage() {
  return (
    <div className={s.groups}>
      {groups.map(g => (
        <section key={g.title}>
          <h2>{g.title}</h2>
          <div className={s.grid}>
            {g.items.map(i => (
              <Link key={i.title} href={i.href} className={s.tile}>
                <span className={s.icon}>
                  <Icon name={i.icon} size={20} />
                </span>
                <strong>{i.title}</strong>
                {i.fresh && <span className={s.dot} />}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
