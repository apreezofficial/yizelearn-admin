import React, {useState} from 'react';
import {Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {errorCodes, isErrorWithCode, pick, types} from '@react-native-documents/picker';
import {adminStyles, Chips, Fab, Row, SearchBox, TabHeader} from '../components/Admin';
import {TabBarSpacer} from '../components/Catalog';
import {Icon} from '../components/Icon';
import {BottomButton, PrimaryAction, TitleBar} from '../components/Layout';
import {Rise} from '../components/Motion';
import {Sheet} from '../components/Sheet';
import {EmptyState} from '../components/States';
import {categories, enrolCheck, statusTone, tags, type AdminCourse} from '../data/admin';
import {useAdmin} from '../data/store';
import {haptic} from '../theme/system';
import {colors, fonts, radius, spacing, type} from '../theme/tokens';

const font = {fontFamily: fonts.family};
const filters = ['All', 'In review', 'Published'] as const;
type Filter = (typeof filters)[number];

export function CoursesScreen({onBell}: {onBell: () => void}) {
  const {courses, updateCourse, deleteCourse} = useAdmin();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [open, setOpen] = useState<AdminCourse>();
  const q = query.trim().toLowerCase();
  const shown = courses.filter(c => (filter === 'All' || c.status === filter) && (!q || c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q)));
  const act = (change: Partial<AdminCourse>, msg: string) => { if (!open) return; updateCourse(open.id, change); haptic.success(); setOpen(undefined); Alert.alert(open.title, msg); };
  const remove = () => {
    if (!open) return;
    const course = open;
    setOpen(undefined);
    setTimeout(() => Alert.alert(`Delete ${course.title}?`, 'Learners lose access and this cannot be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => { haptic.warning(); deleteCourse(course.id); }},
    ]), 300);
  };
  return <View style={adminStyles.screen}>
    <TabHeader title="Courses" onBell={onBell} />
    <View style={styles.tools}>
      <SearchBox value={query} onChangeText={setQuery} placeholder="Search courses" />
      <Chips items={filters} active={filter} onSelect={setFilter} />
    </View>
    <FlatList data={shown} keyExtractor={c => c.id} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
      renderItem={({item, index}) => <Rise delay={index * 50}><Row icon="laptop" title={item.title} detail={`${item.instructor}${item.featured ? ' · Featured' : ''}`} badge={{label: item.status, tone: statusTone[item.status]}} onPress={() => setOpen(item)} /></Rise>}
      ListEmptyComponent={<EmptyState icon="book" title="No courses here" message={filter === 'In review' ? 'Nothing is waiting for review.' : 'Try another search.'} />}
      ListFooterComponent={<TabBarSpacer />} />
    <Sheet visible={!!open} onClose={() => setOpen(undefined)}>
      {open && <>
        <Text style={[styles.sheetTitle, font]}>{open.title}</Text>
        {open.status !== 'Published' && <Row icon="check" title="Review and approve" detail="Publish to the catalog" onPress={() => act({status: 'Published'}, 'Published to the catalog.')} />}
        <Row icon="award" title={open.featured ? 'Remove from home' : 'Feature on home'} detail={open.featured ? 'Take it out of Top courses' : 'Show in Top courses'} onPress={() => act({featured: !open.featured}, open.featured ? 'Removed from Top courses.' : 'Now in Top courses.')} />
        {open.status === 'Published' && <Row icon="lock" title="Unpublish" detail="Hide from the catalog" onPress={() => act({status: 'Unpublished', featured: false}, 'Hidden from the catalog. Learners keep their progress.')} />}
        <Row icon="close" title="Delete course" danger onPress={remove} />
      </>}
    </Sheet>
  </View>;
}

export function CategoriesScreen({onBack}: {onBack: () => void}) {
  const [tab, setTab] = useState<'Categories' | 'Tags'>('Categories');
  const [list, setList] = useState({Categories: categories, Tags: tags});
  // Alert.prompt is iOS-only, so Android adds a placeholder name the admin can rename later.
  const add = () => {
    const name = (value?: string) => { const n = value?.trim(); if (!n) return; haptic.success(); setList(l => ({...l, [tab]: [...l[tab], {name: n, count: 0}]})); };
    if (Alert.prompt) Alert.prompt(`New ${tab === 'Tags' ? 'tag' : 'category'}`, undefined, name);
    else name(`New ${tab === 'Tags' ? 'tag' : 'category'} ${list[tab].length + 1}`);
  };
  return <View style={adminStyles.screen}>
    <TitleBar title="Categories and tags" onBack={onBack} />
    <View style={styles.tools}><Chips items={['Categories', 'Tags'] as const} active={tab} onSelect={setTab} /></View>
    <ScrollView contentContainerStyle={adminStyles.content}>
      {list[tab].map((c, i) => <Rise key={`${tab}-${c.name}`} delay={i * 50}><Row icon={tab === 'Tags' ? 'tag' : 'grid'} title={c.name} detail={`${c.count} courses`} chevron onPress={() => Alert.alert(c.name, `${c.count} courses use this ${tab === 'Tags' ? 'tag' : 'category'}.`)} /></Rise>)}
    </ScrollView>
    <Fab onPress={add} label={`Add ${tab === 'Tags' ? 'tag' : 'category'}`} />
  </View>;
}

export function BulkEnrolScreen({onBack}: {onBack: () => void}) {
  const [file, setFile] = useState<string>();
  const choose = async () => {
    try {
      const [res] = await pick({type: [types.csv, types.plainText]});
      haptic.success();
      setFile(res.name ?? 'learners.csv');
    } catch (e) {
      if (!(isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED)) Alert.alert('Could not open the file', 'Try choosing it again.');
    }
  };
  // Checking rows and enrolling run on the server; the counts below are the sample result until it is connected.
  const enrol = () => { haptic.success(); Alert.alert('Enrolled', `${enrolCheck.ready} learners were enrolled.`); onBack(); };
  return <View style={adminStyles.screen}>
    <TitleBar title="Bulk enrol" onBack={onBack} />
    <ScrollView contentContainerStyle={adminStyles.content}>
      <Pressable onPress={choose} style={({pressed}) => [styles.drop, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Choose a CSV file">
        <View style={styles.dropIcon}><Icon name="upload" size={20} color={colors.blue700} /></View>
        <Text style={[styles.dropTitle, font]}>{file ?? 'Choose a CSV file'}</Text>
        <Text style={[styles.dropHint, font]}>{file ? 'Tap to choose another' : 'One email per row, with a course column'}</Text>
      </Pressable>
      {file ? <>
        <Rise style={styles.counts}>
          <View style={[styles.count, styles.countGood]}><Text style={[styles.countValue, font, styles.good]}>{enrolCheck.ready}</Text><Text style={[styles.countLabel, font]}>ready to enrol</Text></View>
          <View style={[styles.count, styles.countBad]}><Text style={[styles.countValue, font, styles.bad]}>{enrolCheck.problems.length}</Text><Text style={[styles.countLabel, font]}>need fixing</Text></View>
        </Rise>
        <Rise delay={100}>
          <Text style={[adminStyles.section, font, styles.fixTitle]}>Needs fixing</Text>
          {enrolCheck.problems.map(p => <View key={p} style={styles.problem}><Icon name="close" size={14} color={colors.danger} /><Text style={[styles.problemText, font]}>{p}</Text></View>)}
          <PrimaryAction label="Download error report" outline onPress={() => Alert.alert('Error report', 'Downloading reports needs the admin API.')} />
        </Rise>
      </> : <EmptyState icon="users" title="Enrol many learners at once" message="Upload a CSV and we will check every row before anyone is enrolled." />}
    </ScrollView>
    <BottomButton label={file ? `Enrol ${enrolCheck.ready} learners` : 'Choose a file first'} disabled={!file} onPress={enrol} />
  </View>;
}

const styles = StyleSheet.create({
  tools: {paddingHorizontal: spacing.screen},
  list: {paddingHorizontal: spacing.screen, paddingBottom: 28, flexGrow: 1},
  sheetTitle: {fontSize: type.heading, color: colors.ink, fontWeight: '800', marginVertical: 10},
  drop: {alignItems: 'center', gap: 6, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.blue600, borderRadius: radius.card, backgroundColor: colors.blue50, paddingVertical: 22, paddingHorizontal: 16, marginTop: 8},
  pressed: {opacity: 0.8},
  dropIcon: {width: 40, height: 40, borderRadius: 20, backgroundColor: colors.blue100, alignItems: 'center', justifyContent: 'center'},
  dropTitle: {fontSize: type.small, color: colors.ink, fontWeight: '700'},
  dropHint: {fontSize: 12, color: colors.muted},
  counts: {flexDirection: 'row', gap: 10, marginTop: 14},
  count: {flex: 1, borderRadius: radius.card, padding: 14, minHeight: 84, justifyContent: 'space-between'},
  countGood: {backgroundColor: colors.successSoft},
  countBad: {backgroundColor: colors.dangerSoft},
  countValue: {fontSize: 28, fontWeight: '800'},
  good: {color: colors.success},
  bad: {color: colors.danger},
  countLabel: {fontSize: 12, color: colors.ink},
  fixTitle: {marginTop: 20, marginBottom: 6},
  problem: {flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40, borderBottomWidth: 1, borderBottomColor: colors.line},
  problemText: {fontSize: type.caption, color: colors.ink},
});
