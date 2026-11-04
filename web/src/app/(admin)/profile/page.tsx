'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, type IconName } from '@/components/Icon';
import { Switch, useToast } from '@/components/ui';
import { signOut } from '@/lib/auth';
import ui from '@/components/ui.module.css';
import s from '@/components/learning.module.css';
const items: { title: string; detail: string; icon: IconName }[] = [
  { title: 'Profile', detail: 'Name, photo, email', icon: 'users' },
  { title: 'Notification settings', detail: 'Choose alerts', icon: 'bell' },
  {
    title: 'Security and password',
    detail: 'Sign-in and devices',
    icon: 'lock',
  },
  { title: 'Help centre', detail: 'Guides and support', icon: 'courses' },
];
export default function ProfilePage() {
  const [section, setSection] = useState('');
  const [name, setName] = useState('Sunday Nwachukwu');
  const [email, setEmail] = useState('admin@yizelearn.com');
  const [alerts, setAlerts] = useState({
    Courses: true,
    Payments: true,
    Support: true,
  });
  const { toast, node } = useToast();
  const router = useRouter();
  return (
    <div className={s.narrow}>
      {section && (
        <div className={s.heading}>
          <button className={ui.link} onClick={() => setSection('')}>
            ← Back
          </button>
          <h2>{section}</h2>
        </div>
      )}
      {!section &&
        items.map(i => (
          <button
            key={i.title}
            className={ui.row}
            onClick={() => setSection(i.title)}
          >
            <span className={ui.rowIcon}>
              <Icon name={i.icon} />
            </span>
            <span className={ui.rowCopy}>
              <strong>{i.title}</strong>
              <span>{i.detail}</span>
            </span>
            <Icon name="next" />
          </button>
        ))}
      {section === 'Profile' && (
        <form
          onSubmit={e => {
            e.preventDefault();
            toast(
              'Saved in this preview. Account syncing requires the admin API.',
            );
          }}
        >
          <label className={ui.field}>
            <span className={ui.label}>Name</span>
            <input
              className={ui.input}
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </label>
          <label className={ui.field}>
            <span className={ui.label}>Email</span>
            <input
              type="email"
              className={ui.input}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </label>
          <button className={ui.button} disabled={!name.trim()}>
            Save changes
          </button>
        </form>
      )}
      {section === 'Notification settings' && (
        <>
          {Object.entries(alerts).map(([k, v]) => (
            <div key={k} className={ui.row}>
              <span className={ui.rowCopy}>{k} alerts</span>
              <Switch
                label={`${k} alerts`}
                checked={v}
                onChange={checked => setAlerts(a => ({ ...a, [k]: checked }))}
              />
            </div>
          ))}
          <div className={s.actions}>
            <button
              className={ui.button}
              onClick={() =>
                toast(
                  'Saved in this preview. Account syncing requires the admin API.',
                )
              }
            >
              Save changes
            </button>
          </div>
        </>
      )}
      {section === 'Security and password' && (
        <>
          <p className={s.muted}>
            Sign-in uses a verification code sent to your email.
          </p>
          <button
            className={ui.danger}
            onClick={() => {
              signOut();
              router.replace('/login');
              router.refresh();
            }}
          >
            Log out
          </button>
        </>
      )}
      {section === 'Help centre' && (
        <>
          <h3>Manage users</h3>
          <p className={s.muted}>
            Open Users and select a learner to change their role or reset
            access.
          </p>
          <h3>Review courses</h3>
          <p className={s.muted}>
            Open Courses and select a course to approve, feature or unpublish
            it.
          </p>
          <h3>Support</h3>
          <p className={s.muted}>Open Support to reply to learner tickets.</p>
        </>
      )}
      {node}
    </div>
  );
}
