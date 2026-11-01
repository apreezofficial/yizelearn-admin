'use client';

import Image from 'next/image';
import {useRouter, useSearchParams} from 'next/navigation';
import {Suspense, useEffect, useRef, useState} from 'react';
import {requestCode, verifyCode} from '@/lib/auth';
import ui from '@/components/ui.module.css';
import s from './login.module.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RESEND_SECONDS = 30;

export default function LoginPage() {
  return <Suspense><Login /></Suspense>;
}

function Login() {
  const router = useRouter();
  const next = useSearchParams().get('next') || '/';
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);
  const codeInput = useRef<HTMLInputElement>(null);
  const valid = EMAIL.test(email.trim());
  const emailError = touched && email.trim() && !valid ? 'Enter a full email address, like name@example.com' : '';

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(w => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setTouched(true);
    if (!valid || busy) return;
    setBusy(true); setError('');
    try { await requestCode(email.trim()); setStep('code'); setWait(RESEND_SECONDS); setTimeout(() => codeInput.current?.focus(), 50); }
    catch (err) { setError((err as Error).message || 'We could not send the code.'); }
    finally { setBusy(false); }
  };

  const verify = async (value: string) => {
    if (busy) return;
    setBusy(true); setError('');
    try { await verifyCode(email.trim(), value); router.replace(next.startsWith('/') ? next : '/'); router.refresh(); }
    catch (err) { setError((err as Error).message || 'That code did not work.'); setCode(''); }
    finally { setBusy(false); }
  };

  return <main className={s.page}>
    <div className={s.card}>
      <Image src="/logo.png" alt="yizelearn" width={120} height={48} className={s.logo} priority />
      {step === 'email' ? <form onSubmit={send} noValidate>
        <h1 className={s.title}>Admin sign in</h1>
        <p className={s.sub}>We will email you a 6-digit code</p>
        {error && <div className={ui.noticeDanger} role="alert"><strong>We couldn&apos;t send the code</strong><span>{error}</span></div>}
        <label className={ui.label} htmlFor="email">Email</label>
        <input id="email" className={`${ui.input} ${emailError ? ui.inputError : ''}`} type="email" autoComplete="email" autoFocus placeholder="name@example.com"
          value={email} onChange={e => { setEmail(e.target.value); setError(''); }} onBlur={() => setTouched(true)} aria-invalid={!!emailError} aria-describedby={emailError ? 'email-error' : undefined} />
        {emailError && <p id="email-error" className={ui.fieldError}>{emailError}</p>}
        <button className={`${ui.button} ${s.submit}`} disabled={busy || !valid}>{busy ? 'Sending…' : 'Send code'}</button>
      </form> : <div>
        <h1 className={s.title}>Enter the code</h1>
        <p className={s.sub}>We sent a 6-digit code to <strong>{email}</strong></p>
        {error && <div className={ui.noticeDanger} role="alert"><strong>That code didn&apos;t work</strong><span>{error}</span></div>}
        <div className={s.codeRow} onClick={() => codeInput.current?.focus()}>
          {Array.from({length: 6}, (_, i) => <span key={i} className={`${s.codeBox} ${i === code.length ? s.codeActive : ''}`}>{code[i] ?? ''}</span>)}
          <input ref={codeInput} className={s.hidden} inputMode="numeric" autoComplete="one-time-code" maxLength={6} aria-label="6-digit code" value={code}
            onChange={e => { const d = e.target.value.replace(/\D/g, '').slice(0, 6); setCode(d); if (d.length === 6) verify(d); }} />
        </div>
        <div className={s.links}>
          <button type="button" className={ui.link} onClick={() => { setStep('email'); setCode(''); setError(''); }}>Use another email</button>
          <button type="button" className={ui.link} disabled={wait > 0} onClick={() => send()}>{wait > 0 ? `Resend in ${wait}s` : 'Resend code'}</button>
        </div>
      </div>}
    </div>
  </main>;
}
