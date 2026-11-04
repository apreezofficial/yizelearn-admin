import { parseLearnersCsv } from '../src/data/learning';

test('imports quoted names and multiline fields with Windows line endings', () => {
  const result = parseLearnersCsv(
    '\uFEFFname,email\r\n"Obi, Ada",ADA@example.com\r\n"Mercy\nIbe",mercy@example.com',
  );
  expect(result.errors).toEqual([]);
  expect(result.learners.map(p => [p.name, p.email])).toEqual([
    ['Obi, Ada', 'ada@example.com'],
    ['Mercy\nIbe', 'mercy@example.com'],
  ]);
});

test('rejects malformed rows and duplicates while retaining valid learners', () => {
  const result = parseLearnersCsv(
    'name,email\nAda,ada@example.com\nAda,ADA@example.com\nMercy,invalid\n,missing@example.com',
  );
  expect(result.learners).toHaveLength(1);
  expect(result.errors).toEqual([
    'Row 3: duplicate email',
    'Row 4: invalid email',
    'Row 5: missing name',
  ]);
});

test('rejects missing columns and unclosed quotes', () => {
  expect(parseLearnersCsv('email\nada@example.com').errors).toHaveLength(1);
  expect(parseLearnersCsv('name,email\n"Ada,ada@example.com').errors).toEqual([
    'Unclosed quoted field',
  ]);
});
