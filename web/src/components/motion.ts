'use client';

import {useEffect, useState} from 'react';

const reduced = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Counts from 0 up to `target` with an ease-out, after `delay` ms. With reduced motion it shows the number straight away. */
export function useCountUp(target: number, {duration = 1000, delay = 0} = {}) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const ms = reduced() ? 0 : duration;
    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = ms ? Math.min(1, (now - start) / ms) : 1;
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => { frame = requestAnimationFrame(tick); }, reduced() ? 0 : delay);
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [target, duration, delay]);
  return value;
}
