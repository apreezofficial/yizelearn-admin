import React, { createContext, useContext, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  pick,
  types,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import {
  adminStyles,
  Avatar,
  Checkbox,
  Chips,
  Fab,
  Field,
  Row,
  SearchBox,
  Select,
} from '../components/Admin';
import { BottomButton, PrimaryAction, TitleBar } from '../components/Layout';
import { Icon } from '../components/Icon';
import { Sheet } from '../components/Sheet';
import { EmptyState } from '../components/States';
import { initials } from '../data/admin';
import {
  certificates,
  initialCohorts,
  learners as seedLearners,
  learningCourses,
  parseLearnersCsv,
  type Cohort,
  type Learner,
} from '../data/learning';
import { colors, radius, type } from '../theme/tokens';

export type LearningPage = 'Cohorts' | 'AtRisk' | 'Reports' | 'Certificates';
const LearningContext = createContext<{
  cohorts: Cohort[];
  people: Learner[];
  add: (c: Cohort, people: Learner[]) => void;
}>({ cohorts: initialCohorts, people: seedLearners, add: () => undefined });
export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [cohorts, setCohorts] = useState(initialCohorts);
  const [people, setPeople] = useState(seedLearners);
  return (
    <LearningContext.Provider
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
    </LearningContext.Provider>
  );
}

export function LearningScreen({
  page,
  onBack,
  onMessage,
}: {
  page: LearningPage;
  onBack: () => void;
  onMessage: (cohort: string) => void;
}) {
  const { cohorts, people, add } = useContext(LearningContext);
  const [view, setView] = useState('list');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Active');
  const [selected, setSelected] = useState<Cohort>();
  const [person, setPerson] = useState<Learner>();
  const [certificateFilter, setCertificateFilter] = useState('All');
  const [certificate, setCertificate] = useState(certificates[0]);
  const [name, setName] = useState('');
  const [start, setStart] = useState('2026-11-01');
  const [end, setEnd] = useState('2026-12-31');
  const [goal, setGoal] = useState('80');
  const [picked, setPicked] = useState<string[]>([]);
  const [assigned, setAssigned] = useState<string[]>([]);
  const [imported, setImported] = useState<Learner[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [release, setRelease] = useState('All at once');
  const [cohortTab, setCohortTab] = useState('Learners');
  const [report, setReport] = useState('Completion');
  const [reportCohort, setReportCohort] = useState('All cohorts');
  const [dates, setDates] = useState('Last 30 days');
  const [sheet, setSheet] = useState('');
  const toggle = (
    value: string,
    list: string[],
    update: (x: string[]) => void,
  ) =>
    update(
      list.includes(value) ? list.filter(x => x !== value) : [...list, value],
    );
  const share = (message: string) => {
    Share.share({ message }).catch(() =>
      Alert.alert('Could not share', 'Please try again.'),
    );
  };
  const back = () => {
    if (view === 'list') onBack();
    else if (view === 'courses') setView('learners');
    else if (view === 'learners') setView('new');
    else if (view === 'csv' || view === 'checked') setView('learners');
    else if (view === 'courseProgress') setView('learner');
    else setView('list');
  };
  const chooseCsv = async () => {
    try {
      const [file] = await pick({ type: [types.csv, types.plainText] });
      const response = await fetch(file.uri);
      const result = parseLearnersCsv(await response.text());
      setImported(
        result.learners.map(p => {
          const existing = people.find(
            x => x.email.toLowerCase() === p.email.toLowerCase(),
          );
          return existing ? { ...existing, name: p.name } : p;
        }),
      );
      setErrors(result.errors);
      setView('checked');
    } catch (e) {
      if (!(isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED))
        Alert.alert(
          'Could not read CSV',
          'Choose a readable CSV with name and email columns.',
        );
    }
  };
  const validDates =
    /^\d{4}-\d{2}-\d{2}$/.test(start) &&
    /^\d{4}-\d{2}-\d{2}$/.test(end) &&
    Number.isFinite(Date.parse(start)) &&
    Number.isFinite(Date.parse(end)) &&
    end >= start;
  const create = () => {
    const c: Cohort = {
      id: `cohort-${Date.now()}`,
      name: name.trim(),
      start,
      end,
      goal: Number(goal),
      learners: picked,
      courses: assigned,
      completion: 0,
      finished: false,
      release,
    };
    add(
      c,
      imported.filter(p => picked.includes(p.id)),
    );
    setSelected(c);
    setView('created');
  };
  const allPeople = [
    ...people,
    ...imported.filter(p => !people.some(x => x.id === p.id)),
  ];
  const memberRows = (list: Learner[], selectable = false) =>
    list.map(p => (
      <Row
        key={p.id}
        title={p.name}
        detail={selectable ? p.email : `Progress ${p.progress}%`}
        initials={initials(p.name)}
        chevron={!selectable}
        left={
          selectable ? <Checkbox checked={picked.includes(p.id)} /> : undefined
        }
        onPress={() =>
          selectable
            ? toggle(p.id, picked, setPicked)
            : (setPerson(p), setView('learner'))
        }
      />
    ));
  const reportRows = cohorts.filter(
    c => reportCohort === 'All cohorts' || c.name === reportCohort,
  );
  const reportCsv = `${report},${dates}\nCohort,Completion\n${reportRows
    .map(c => `"${c.name}",${c.completion}%`)
    .join('\n')}`;
  const title =
    view === 'new'
      ? 'New cohort'
      : view === 'learners'
      ? 'Add learners'
      : view === 'csv'
      ? 'Upload CSV'
      : view === 'checked'
      ? 'CSV checked'
      : view === 'courses'
      ? 'Assign courses'
      : view === 'detail'
      ? selected?.name ?? 'Cohort'
      : view === 'learner'
      ? 'Learner'
      : view === 'courseProgress'
      ? 'Data analysis in Excel'
      : view === 'certificate'
      ? 'Certificate'
      : view === 'preview'
      ? `${report} report`
      : view === 'export'
      ? 'Export'
      : page === 'AtRisk'
      ? 'At risk'
      : page;
  let content: React.ReactNode;
  let bottom: React.ReactNode;
  if (view === 'created' || view === 'export') {
    content = (
      <View style={styles.success}>
        <View style={styles.successRing}>
          <Icon name="check" color={colors.success} size={40} />
          <View style={styles.dot} />
        </View>
        <Text style={styles.successTitle}>
          {view === 'created' ? 'Cohort created' : 'Your report is ready'}
        </Text>
        <Text style={styles.subtitle}>
          {view === 'created'
            ? `${selected?.name} has ${selected?.learners.length} learners and ${selected?.courses.length} courses.`
            : `${report} report, ${dates}\nCSV`}
        </Text>
        <PrimaryAction
          label={view === 'created' ? 'View cohort' : 'Share CSV'}
          onPress={() =>
            view === 'created' ? setView('detail') : share(reportCsv)
          }
        />
        <PrimaryAction
          label={view === 'created' ? 'Back to cohorts' : 'Back to reports'}
          outline
          onPress={() => setView('list')}
        />
      </View>
    );
  } else if (view === 'new') {
    content = (
      <>
        <Step n={1} />
        <Field
          label="Cohort name"
          value={name}
          onChangeText={setName}
          placeholder="Sales team, November"
        />
        <View style={styles.columns}>
          <View style={styles.flex}>
            <Field
              label="Start date (YYYY-MM-DD)"
              value={start}
              onChangeText={setStart}
            />
          </View>
          <View style={styles.flex}>
            <Field
              label="End date (YYYY-MM-DD)"
              value={end}
              onChangeText={setEnd}
            />
          </View>
        </View>
        <Field
          label="Completion goal (%)"
          value={goal}
          onChangeText={setGoal}
          keyboardType="numeric"
        />
      </>
    );
    bottom = (
      <BottomButton
        label="Next: add learners"
        disabled={
          !name.trim() ||
          !validDates ||
          !(Number(goal) > 0 && Number(goal) <= 100)
        }
        onPress={() => {
          setQuery('');
          setView('learners');
        }}
      />
    );
  } else if (view === 'learners') {
    content = (
      <>
        <Step n={2} />
        <Chips
          items={['Pick from list', 'Upload CSV']}
          active="Pick from list"
          onSelect={v => v === 'Upload CSV' && setView('csv')}
        />
        <SearchBox
          value={query}
          onChangeText={setQuery}
          placeholder="Search learners"
        />
        {memberRows(
          allPeople.filter(p =>
            `${p.name} ${p.email}`.toLowerCase().includes(query.toLowerCase()),
          ),
          true,
        )}
      </>
    );
    bottom = (
      <BottomButton
        label={`Add ${picked.length} learners`}
        disabled={!picked.length}
        onPress={() => setView('courses')}
      />
    );
  } else if (view === 'csv') {
    content = (
      <>
        <Pressable
          style={styles.drop}
          accessibilityRole="button"
          onPress={chooseCsv}
        >
          <Icon name="upload" color={colors.blue700} size={30} />
          <Text style={styles.section}>Choose a CSV file</Text>
          <Text style={styles.subtitle}>Columns: name, email</Text>
        </Pressable>
        <PrimaryAction
          label="Share template"
          outline
          onPress={() => share('name,email\nMercy Ibe,mercy@example.com')}
        />
      </>
    );
  } else if (view === 'checked') {
    content = (
      <>
        <View style={styles.columns}>
          <Count value={imported.length} label="ready to add" />
          <Count value={errors.length} label="need fixing" warning />
        </View>
        {errors.map(e => (
          <Text key={e} style={styles.error}>
            {e}
          </Text>
        ))}
        <Text style={styles.section}>Preview</Text>
        {memberRows(imported, true)}
      </>
    );
    bottom = (
      <BottomButton
        label={`Add ${imported.length} learners`}
        disabled={!imported.length}
        onPress={() => {
          setPicked(x => [...new Set([...x, ...imported.map(p => p.id)])]);
          setView('courses');
        }}
      />
    );
  } else if (view === 'courses') {
    content = (
      <>
        <Step n={3} />
        {learningCourses.map(c => (
          <Pressable
            key={c}
            style={[styles.choice, assigned.includes(c) && styles.choiceOn]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: assigned.includes(c) }}
            onPress={() => toggle(c, assigned, setAssigned)}
          >
            <Checkbox checked={assigned.includes(c)} />
            <View style={styles.flex}>
              <Text style={styles.section}>{c}</Text>
              <Pressable onPress={() => setSheet('Release schedule')}>
                <Text style={styles.subtitle}>{release} · Change schedule</Text>
              </Pressable>
            </View>
          </Pressable>
        ))}
      </>
    );
    bottom = (
      <BottomButton
        label="Create cohort"
        disabled={!assigned.length}
        onPress={create}
      />
    );
  } else if (view === 'detail' && selected) {
    content = (
      <>
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Completion</Text>
          <Text style={styles.heroValue}>{selected.completion}%</Text>
          <Progress value={selected.completion} />
        </View>
        <Chips
          items={['Learners', 'Courses', 'Activity']}
          active={cohortTab}
          onSelect={setCohortTab}
        />
        {cohortTab === 'Learners' ? (
          memberRows(allPeople.filter(p => selected.learners.includes(p.id)))
        ) : cohortTab === 'Courses' ? (
          selected.courses.map(c => (
            <Row key={c} icon="laptop" title={c} detail={selected.release} />
          ))
        ) : (
          <Row
            icon="calendar"
            title="Cohort schedule"
            detail={`${selected.start} to ${selected.end}`}
          />
        )}
      </>
    );
    bottom = (
      <BottomButton
        label="Message cohort"
        onPress={() => onMessage(selected.name)}
      />
    );
  } else if (view === 'learner' && person) {
    content = (
      <>
        <View style={styles.profile}>
          <Avatar initials={initials(person.name)} size={76} />
          <Text style={styles.successTitle}>{person.name}</Text>
          <Text style={styles.subtitle}>
            Student, {person.cohort || 'Not in a cohort'}
          </Text>
        </View>
        <View style={styles.warning}>
          <Text style={styles.subtitle}>Overall progress</Text>
          <Progress value={person.progress} />
          <Text style={styles.section}>
            {person.progress}% · Behind schedule
          </Text>
        </View>
        <Row
          title="Data analysis in Excel"
          value={`${person.progress}%`}
          onPress={() => setView('courseProgress')}
        />
        <Row title="Business writing" value="Not started" />
      </>
    );
    bottom = (
      <BottomButton
        label="Send reminder"
        onPress={() => setSheet('Send reminder')}
      />
    );
  } else if (view === 'courseProgress' && person) {
    content = (
      <>
        <View style={styles.warning}>
          <Text style={styles.subtitle}>Progress</Text>
          <Progress value={person.progress} />
          <Text style={styles.section}>
            {Math.round((person.progress * 24) / 100)} of 24 lessons
          </Text>
        </View>
        <Row title="Module 1 quiz" value="90%" />
        <Row title="Module 2 quiz" value="Not taken" />
        <Row title="Assignment 1" value="Not submitted" />
      </>
    );
    bottom = (
      <BottomButton
        label="Send reminder"
        onPress={() => setSheet('Send reminder')}
      />
    );
  } else if (view === 'certificate') {
    content = (
      <>
        <View style={styles.summary}>
          <Text style={styles.subtitle}>{certificate.course}</Text>
          <Text style={styles.big}>{certificate.name}</Text>
        </View>
        <Row title="ID" value={certificate.id} />
        <Row title="Score" value={`${certificate.score}%`} />
        <Row title="Issued" value={certificate.issued} />
      </>
    );
    bottom = (
      <BottomButton
        label="Share certificate"
        onPress={() =>
          share(
            `${certificate.id}\n${certificate.name}\n${certificate.course}\nScore: ${certificate.score}%\nIssued: ${certificate.issued}`,
          )
        }
      />
    );
  } else if (view === 'preview') {
    content = (
      <>
        <View style={styles.chart}>
          <Text style={styles.section}>{report} by cohort</Text>
          <View style={styles.bars}>
            {reportRows.map(c => (
              <View key={c.id} style={styles.barColumn}>
                <Text style={styles.subtitle}>{c.completion}%</Text>
                <View style={[styles.bar, { height: c.completion }]} />
                <Text style={styles.subtitle}>{c.name}</Text>
              </View>
            ))}
          </View>
        </View>
        {reportRows.map(c => (
          <Row key={c.id} title={c.name} value={`${c.completion}%`} />
        ))}
      </>
    );
    bottom = (
      <BottomButton label="Export CSV" onPress={() => setView('export')} />
    );
  } else if (page === 'Reports') {
    content = (
      <>
        {['Completion', 'Grades', 'Engagement'].map((r, i) => (
          <Pressable
            key={r}
            style={[styles.choice, report === r && styles.choiceOn]}
            accessibilityRole="radio"
            accessibilityState={{ selected: report === r }}
            onPress={() => setReport(r)}
          >
            <Icon
              name={i === 0 ? 'chart' : i === 1 ? 'award' : 'users'}
              size={24}
              color={colors.blue700}
            />
            <View>
              <Text style={styles.section}>{r}</Text>
              <Text style={styles.subtitle}>
                {
                  [
                    'By cohort and date',
                    'Scores per course',
                    'Active time and logins',
                  ][i]
                }
              </Text>
            </View>
          </Pressable>
        ))}
        <Select
          label="Cohort"
          value={reportCohort}
          options={['All cohorts', ...cohorts.map(c => c.name)]}
          onChange={setReportCohort}
        />
        <Select
          label="Dates"
          value={dates}
          options={['Last 7 days', 'Last 30 days', 'This quarter']}
          onChange={setDates}
        />
        {report !== 'Completion' && (
          <Text style={styles.subtitle}>
            No {report.toLowerCase()} data is available in this sample.
          </Text>
        )}
      </>
    );
    bottom = (
      <BottomButton
        label="Preview report"
        disabled={report !== 'Completion'}
        onPress={() => setView('preview')}
      />
    );
  } else if (page === 'AtRisk') {
    const shown = people.filter(
      p =>
        p.cohort &&
        p.progress < 40 &&
        (filter === 'Active' || filter === 'All' || p.state === filter),
    );
    content = (
      <>
        <Chips
          items={['All', 'Behind', 'Not started']}
          active={filter === 'Active' ? 'All' : filter}
          onSelect={setFilter}
        />
        {shown.map(p => (
          <Row
            key={p.id}
            title={p.name}
            detail={`${p.cohort}, ${p.progress}%`}
            initials={initials(p.name)}
            badge={{ label: 'Pending', tone: 'gold' }}
            onPress={() => {
              setPerson(p);
              setView('learner');
            }}
          />
        ))}
        {!shown.length && (
          <EmptyState
            icon="users"
            title="No learners here"
            message="Try another filter."
          />
        )}
      </>
    );
  } else if (page === 'Certificates') {
    content = (
      <>
        <SearchBox
          value={query}
          onChangeText={setQuery}
          placeholder="Search certificates"
        />
        <Chips items={['All', 'This month']} active={certificateFilter} onSelect={setCertificateFilter} />
        {certificates
          .filter(c => (certificateFilter === 'All' || (new Date(c.issued).getMonth() === new Date().getMonth() && new Date(c.issued).getFullYear() === new Date().getFullYear())))
          .filter(c =>
            `${c.name} ${c.course}`.toLowerCase().includes(query.toLowerCase()),
          )
          .map(c => (
            <Row
              key={c.id}
              icon="award"
              title={c.name}
              detail={`${c.course}, ${c.issued}`}
              chevron
              onPress={() => {
                setCertificate(c);
                setView('certificate');
              }}
            />
          ))}
      </>
    );
  } else {
    const shown = cohorts.filter(c => c.finished === (filter === 'Finished'));
    content = (
      <>
        <Chips
          items={['Active', 'Finished']}
          active={filter}
          onSelect={setFilter}
        />
        {shown.map(c => (
          <Row
            key={c.id}
            icon="users"
            title={c.name}
            detail={`${c.learners.length} learners, ${c.completion}%`}
            badge={{ label: c.finished ? 'Done' : 'Active', tone: 'green' }}
            onPress={() => {
              setSelected(c);
              setView('detail');
            }}
          />
        ))}
        {!shown.length && (
          <EmptyState
            icon="users"
            title="No cohorts yet"
            message="Create a cohort to get started."
          />
        )}
      </>
    );
  }
  return (
    <View style={adminStyles.screen}>
      <TitleBar title={title} onBack={back} />
      <ScrollView
        contentContainerStyle={[
          adminStyles.content,
          { flexGrow: 1, paddingTop: 10 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {content}
      </ScrollView>
      {bottom}
      {page === 'Cohorts' && view === 'list' && (
        <Fab
          label="New cohort"
          onPress={() => {
            setName('');
            setPicked([]);
            setAssigned([]);
            setImported([]);
            setView('new');
          }}
        />
      )}
      <Sheet visible={!!sheet} onClose={() => setSheet('')}>
        <Text style={styles.successTitle}>{sheet}</Text>
        {sheet === 'Release schedule' ? (
          <>
            <Chips
              items={['All at once', 'One module a week']}
              active={release}
              onSelect={setRelease}
            />
            <PrimaryAction label="Save" onPress={() => setSheet('')} />
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>
              {person?.name}, {person?.cohort}
            </Text>
            <Field
              label="Message"
              value={undefined}
              defaultValue="Your course is waiting for you."
            />
            <PrimaryAction
              label="Send reminder"
              onPress={() => {
                setSheet('');
                Alert.alert(
                  'Reminder preview',
                  'The reminder is ready. Delivery requires the admin messaging API.',
                );
              }}
            />
          </>
        )}
      </Sheet>
    </View>
  );
}
function Step({ n }: { n: number }) {
  return (
    <View style={styles.step}>
      <Progress value={(n / 3) * 100} />
      <Text style={styles.subtitle}>
        Step {n} of 3: {['Details', 'Learners', 'Courses'][n - 1]}
      </Text>
    </View>
  );
}
function Progress({ value }: { value: number }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${value}%` }]} />
    </View>
  );
}
function Count({
  value,
  label,
  warning,
}: {
  value: number;
  label: string;
  warning?: boolean;
}) {
  return (
    <View style={[styles.count, warning && styles.warning]}>
      <Text style={styles.big}>{value}</Text>
      <Text style={styles.subtitle}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  columns: { flexDirection: 'row', gap: 12 },
  section: { fontSize: type.label, fontWeight: '700', color: colors.ink },
  subtitle: {
    fontSize: type.caption,
    color: colors.muted,
    lineHeight: 21,
    marginVertical: 5,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.field,
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 12,
  },
  choiceOn: {
    borderColor: colors.blue700,
    borderWidth: 1.5,
    backgroundColor: colors.blue50,
  },
  step: { marginBottom: 18 },
  track: {
    height: 5,
    backgroundColor: colors.sandLine,
    borderRadius: 3,
    marginVertical: 8,
    overflow: 'hidden',
  },
  fill: { height: 5, backgroundColor: colors.blue700, borderRadius: 3 },
  hero: {
    backgroundColor: '#17335A',
    borderRadius: radius.card,
    padding: 18,
    marginBottom: 12,
  },
  heroLabel: { color: '#C4DBF6', fontSize: 13 },
  heroValue: { color: '#FFFFFF', fontWeight: '800', fontSize: 36 },
  profile: { alignItems: 'center', paddingVertical: 16 },
  summary: {
    backgroundColor: colors.blue50,
    padding: 28,
    borderRadius: radius.card,
    alignItems: 'center',
    marginBottom: 16,
  },
  big: { fontSize: 32, fontWeight: '800', color: colors.ink },
  warning: {
    padding: 16,
    borderRadius: radius.card,
    backgroundColor: colors.warningSoft,
    marginBottom: 16,
  },
  success: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '90%',
    maxWidth: 420,
    paddingBottom: 40,
  },
  successTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.ink,
    marginVertical: 14,
  },
  successRing: {
    alignSelf: 'center',
    width: 144,
    height: 144,
    borderRadius: 72,
    borderWidth: 22,
    borderColor: colors.successSoft,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    position: 'absolute',
    right: -22,
    top: -12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.marigold,
  },
  drop: {
    padding: 30,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.sky,
    backgroundColor: colors.blue50,
    borderRadius: radius.card,
    alignItems: 'center',
    gap: 12,
  },
  count: {
    flex: 1,
    padding: 18,
    backgroundColor: colors.successSoft,
    borderRadius: radius.card,
    marginBottom: 16,
  },
  error: { color: colors.danger, paddingVertical: 8 },
  chart: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: 16,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
    marginTop: 20,
  },
  barColumn: { flex: 1, alignItems: 'center' },
  bar: { backgroundColor: colors.blue100, width: '80%', borderRadius: 4 },
});
