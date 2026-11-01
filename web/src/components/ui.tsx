'use client';

import {useEffect, useState} from 'react';
import type {Tone} from '@/lib/data';
import {Icon} from './Icon';
import ui from './ui.module.css';

export const initials = (name: string) => name.split(/[\s@.]/).filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase();

export function Avatar({name, size = 40}: {name: string; size?: number}) {
  return <span className={ui.avatar} style={{width: size, height: size, fontSize: size * 0.32}} aria-hidden>{initials(name)}</span>;
}

export function Badge({label, tone}: {label: string; tone: Tone}) {
  return <span className={`${ui.badge} ${ui[tone]}`}>{label}</span>;
}

export function Search({value, onChange, placeholder}: {value: string; onChange: (v: string) => void; placeholder: string}) {
  return <label className={ui.search}>
    <Icon name="search" size={18} />
    <input type="search" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
  </label>;
}

export function Chips<T extends string>({items, active, onSelect}: {items: readonly T[]; active: T; onSelect: (v: T) => void}) {
  return <div className={ui.chips} role="tablist">
    {items.map(i => <button key={i} role="tab" aria-selected={i === active} className={i === active ? ui.chipOn : ui.chip} onClick={() => onSelect(i)}>{i}</button>)}
  </div>;
}

export function Switch({checked, onChange, label}: {checked: boolean; onChange: (v: boolean) => void; label: string}) {
  return <button role="switch" aria-checked={checked} aria-label={label} className={ui.switch} onClick={() => onChange(!checked)} />;
}

export function Dialog({title, children, onClose, actions}: {title: string; children?: React.ReactNode; onClose: () => void; actions: React.ReactNode}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return <div className={ui.backdrop} onClick={onClose}>
    <div className={ui.dialog} role="dialog" aria-modal aria-label={title} onClick={e => e.stopPropagation()}>
      <h2>{title}</h2>
      {children}
      <div className={ui.dialogActions}>{actions}</div>
    </div>
  </div>;
}

/** A short confirmation that fades away, so actions feel done without a blocking alert. */
export function useToast() {
  const [msg, setMsg] = useState('');
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(''), 2600);
    return () => clearTimeout(t);
  }, [msg]);
  return {toast: setMsg, node: msg ? <div className={ui.toast} role="status">{msg}</div> : null};
}

export function Empty({title, message}: {title: string; message: string}) {
  return <div className={ui.empty}><strong>{title}</strong>{message}</div>;
}
