'use client';
import { createContext, useContext, useState } from 'react';
import {
  initialCohorts,
  learners,
  type Cohort,
  type Learner,
} from '@/lib/learning';
const Context = createContext<{
  cohorts: Cohort[];
  people: Learner[];
  add: (c: Cohort, p: Learner[]) => void;
}>({ cohorts: initialCohorts, people: learners, add: () => undefined });
export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [cohorts, setCohorts] = useState(initialCohorts);
  const [people, setPeople] = useState(learners);
  return (
    <Context.Provider
      value={{
        cohorts,
        people,
        add: (c, imported) => {
          setCohorts(x => [...x, c]);
          setPeople(x => [
            ...x.filter(p => !imported.some(i => i.id === p.id)),
            ...imported,
          ]);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useLearning = () => useContext(Context);
