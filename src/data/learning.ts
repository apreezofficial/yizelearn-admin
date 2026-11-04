// Shared sample data and validation for the native and web admin interfaces.
export type Learner = {
  id: string;
  name: string;
  email: string;
  cohort: string;
  progress: number;
  state: 'Behind' | 'Not started';
};
export type Cohort = {
  id: string;
  name: string;
  learners: string[];
  courses: string[];
  completion: number;
  finished: boolean;
  start: string;
  end: string;
  goal: number;
  release: string;
};
export const learners: Learner[] = [
  {
    id: 'mi',
    name: 'Mercy Ibe',
    email: 'mercy@example.com',
    cohort: 'Sales team, Oct',
    progress: 64,
    state: 'Behind',
  },
  {
    id: 'ce',
    name: 'Chidi Eze',
    email: 'chidi@example.com',
    cohort: 'Sales team, Oct',
    progress: 22,
    state: 'Behind',
  },
  {
    id: 'ao',
    name: 'Ada Obi',
    email: 'ada@example.com',
    cohort: 'Sales team, Oct',
    progress: 64,
    state: 'Behind',
  },
  {
    id: 'tb',
    name: 'Tunde Bello',
    email: 'tunde@example.com',
    cohort: '',
    progress: 0,
    state: 'Not started',
  },
  {
    id: 'ia',
    name: 'Ife Ade',
    email: 'ife@example.com',
    cohort: 'Finance, Q4',
    progress: 30,
    state: 'Behind',
  },
  {
    id: 'sn',
    name: 'Sunday Nwachukwu',
    email: 'sunday@example.com',
    cohort: 'Graduate trainees',
    progress: 0,
    state: 'Not started',
  },
];
export const initialCohorts: Cohort[] = [
  {
    id: 'sales',
    name: 'Sales team, Oct',
    learners: ['mi', 'ce', 'ao'],
    courses: ['Data analysis in Excel', 'Business writing'],
    completion: 72,
    finished: false,
    start: '2026-10-01',
    end: '2026-10-31',
    goal: 80,
    release: 'All at once',
  },
  {
    id: 'graduates',
    name: 'Graduate trainees',
    learners: ['sn'],
    courses: ['Intro to Python'],
    completion: 55,
    finished: false,
    start: '2026-10-01',
    end: '2026-12-31',
    goal: 80,
    release: 'One module a week',
  },
  {
    id: 'finance',
    name: 'Finance, Q4',
    learners: ['ia'],
    courses: ['Business writing'],
    completion: 90,
    finished: true,
    start: '2026-10-01',
    end: '2026-12-31',
    goal: 80,
    release: 'All at once',
  },
];
export const learningCourses = [
  'Data analysis in Excel',
  'Business writing',
  'Intro to Python',
];
export const certificates = [
  {
    id: 'CERT-8841',
    name: 'Ada Obi',
    course: 'Data analysis in Excel',
    score: 92,
    issued: '12 Oct 2026',
  },
  {
    id: 'CERT-8840',
    name: 'Ife Ade',
    course: 'Business writing',
    score: 89,
    issued: '9 Oct 2026',
  },
  {
    id: 'CERT-8839',
    name: 'Mercy Ibe',
    course: 'Data analysis in Excel',
    score: 94,
    issued: '6 Oct 2026',
  },
];
export type CsvResult = { learners: Learner[]; errors: string[] };
export function parseLearnersCsv(text: string): CsvResult {
  const rows: string[][] = [];
  let row: string[] = [],
    field = '',
    quoted = false;
  const input = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '"') {
      if (quoted && input[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = !quoted;
    } else if (!quoted && (c === ',' || c === '\n' || c === '\r')) {
      row.push(field.trim());
      field = '';
      if (c !== ',') {
        if (row.some(Boolean)) rows.push(row);
        row = [];
        if (c === '\r' && input[i + 1] === '\n') i++;
      }
    } else field += c;
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  if (quoted) return { learners: [], errors: ['Unclosed quoted field'] };
  const header = rows.shift()?.map(c => c.toLowerCase());
  const ni = header?.indexOf('name') ?? -1,
    ei = header?.indexOf('email') ?? -1;
  if (ni < 0 || ei < 0)
    return { learners: [], errors: ['CSV must have name and email columns'] };
  const result: CsvResult = { learners: [], errors: [] };
  const seen = new Set<string>();
  rows.forEach((r, i) => {
    const name = r[ni],
      email = r[ei]?.toLowerCase();
    const error = !name
      ? 'missing name'
      : !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? 'invalid email'
      : seen.has(email)
      ? 'duplicate email'
      : '';
    if (error) result.errors.push(`Row ${i + 2}: ${error}`);
    else {
      seen.add(email);
      result.learners.push({
        id: email,
        name,
        email,
        cohort: '',
        progress: 0,
        state: 'Not started',
      });
    }
  });
  if (!rows.length) result.errors.push('No learners found');
  return result;
}
