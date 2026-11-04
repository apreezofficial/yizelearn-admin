import React, {useRef, useState} from 'react';
import {Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ScrollViewInstance} from 'react-native';
import {adminStyles, ButtonPair, Chips, Field, Row, SearchBox, Select, TabHeader, Toggle} from '../components/Admin';
import {TabBarSpacer} from '../components/Catalog';
import {Icon, type IconName} from '../components/Icon';
import {BottomButton, TitleBar} from '../components/Layout';
import {Rise} from '../components/Motion';
import {EmptyState} from '../components/States';
import {auditLog, instructorCount, instructorPermissions} from '../data/admin';
import {useAdmin} from '../data/store';
import {haptic} from '../theme/system';
import {colors, fonts, radius, spacing, type} from '../theme/tokens';

const font = {fontFamily: fonts.family};

export type MorePage = 'Cohorts' | 'AtRisk' | 'Reports' | 'Certificates' | 'Profile' | 'Categories' | 'BulkEnrol' | 'Promos' | 'Role' | 'Audit' | 'Integrations' | 'Support' | 'Announcement' | 'Privacy';
const groups: {title: string; items: {page: MorePage; title: string; icon: IconName; fresh?: boolean}[]}[] = [
  {title: 'Learning', items: [
    {page: 'Cohorts', title: 'Cohorts', icon: 'users', fresh: true}, {page: 'AtRisk', title: 'At risk', icon: 'alert', fresh: true},
    {page: 'Certificates', title: 'Certificates', icon: 'award', fresh: true}, {page: 'Reports', title: 'Reports', icon: 'chart', fresh: true},
  ]},
  {title: 'Platform', items: [{page: 'Role', title: 'Roles', icon: 'role'}, {page: 'Integrations', title: 'Integrations', icon: 'grid'}, {page: 'Audit', title: 'Audit log', icon: 'file'}, {page: 'Privacy', title: 'Privacy', icon: 'lock'}]},
  {title: 'Communicate', items: [{page: 'Announcement', title: 'Announcements', icon: 'bell'}, {page: 'Support', title: 'Support', icon: 'message'}]},
  {title: 'Setup', items: [{page: 'Categories', title: 'Categories', icon: 'laptop'}, {page: 'BulkEnrol', title: 'Bulk enrol', icon: 'upload'}, {page: 'Profile', title: 'Settings', icon: 'settings'}]},
];
export function MoreScreen({onBell, onOpen, onLogout}: {onBell: () => void; onOpen: (p: MorePage) => void; onLogout: () => void}) {
  return <View style={adminStyles.screen}>
    <TabHeader title="More" onBell={onBell} onProfile={() => onOpen('Profile')} />
    <ScrollView contentContainerStyle={adminStyles.content} showsVerticalScrollIndicator={false}>
      {groups.map(group => <View key={group.title} style={{marginBottom: 18}}><Text style={{fontSize: type.caption, color: colors.muted, fontWeight: '700', marginBottom: 8}}>{group.title}</Text><View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>{group.items.map(item => <Pressable key={item.page} onPress={() => onOpen(item.page)} accessibilityRole="button" style={{width: '31.5%', minHeight: 68, padding: 8, gap: 6, borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center'}}><View style={{backgroundColor: colors.blue100, padding: 6, borderRadius: 20}}><Icon name={item.icon} size={17} color={colors.blue700} /></View><Text style={{fontSize: 11, fontWeight: '700', color: colors.ink}}>{item.title}</Text>{item.fresh && <View style={{position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.marigold}} />}</Pressable>)}</View></View>)}
      <Row icon="logout" title="Log out" danger onPress={onLogout} /><TabBarSpacer />
    </ScrollView>
  </View>;
}

export function InstructorRoleScreen({onBack}: {onBack: () => void}) {
  const [perms, setPerms] = useState(() => Object.fromEntries(instructorPermissions.map(p => [p.key, p.on])) as Record<string, boolean>);
  const saved = useRef(perms);
  const changed = instructorPermissions.some(p => perms[p.key] !== saved.current[p.key]);
  const save = () => { saved.current = perms; haptic.success(); Alert.alert('Saved', `Changes apply to ${instructorCount} instructors.`); onBack(); };
  return <View style={adminStyles.screen}>
    <TitleBar title="Instructor role" onBack={onBack} />
    <ScrollView contentContainerStyle={adminStyles.content}>
      <View style={styles.info}><Text style={[styles.infoText, font]}>Changes apply to {instructorCount} instructors</Text></View>
      {instructorPermissions.map(p => <Toggle key={p.key} label={p.label} value={perms[p.key]} onChange={v => setPerms(x => ({...x, [p.key]: v}))} />)}
    </ScrollView>
    <BottomButton label="Save changes" disabled={!changed} onPress={save} />
  </View>;
}

export function AuditLogScreen({onBack}: {onBack: () => void}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Users' | 'Payments'>('All');
  const q = query.trim().toLowerCase();
  const shown = auditLog.filter(e => (filter === 'All' || e.kind === filter) && (!q || e.title.toLowerCase().includes(q) || e.who.toLowerCase().includes(q)));
  return <View style={adminStyles.screen}>
    <TitleBar title="Audit log" onBack={onBack} />
    <View style={styles.tools}><SearchBox value={query} onChangeText={setQuery} placeholder="Search log" /><Chips items={['All', 'Users', 'Payments'] as const} active={filter} onSelect={setFilter} /></View>
    <ScrollView contentContainerStyle={adminStyles.content} keyboardShouldPersistTaps="handled">
      {shown.map((e, i) => <Rise key={e.id} delay={i * 50}><Row icon="file" title={e.title} detail={e.who} chevron onPress={() => Alert.alert(e.title, e.who)} /></Rise>)}
      {!shown.length && <EmptyState icon="search" title="Nothing in the log" message="Try another search." />}
    </ScrollView>
  </View>;
}

export function IntegrationsScreen({onBack, onConfigure}: {onBack: () => void; onConfigure: (id: string) => void}) {
  const {integrations} = useAdmin();
  return <View style={adminStyles.screen}>
    <TitleBar title="Integrations" onBack={onBack} />
    <ScrollView contentContainerStyle={adminStyles.content}>
      {integrations.map((x, i) => <Rise key={x.id} delay={i * 50}><Row icon="grid" title={x.name} badge={{label: x.connected ? 'Connected' : 'Not set up', tone: x.connected ? 'green' : 'grey'}} onPress={() => onConfigure(x.id)} /></Rise>)}
    </ScrollView>
  </View>;
}

export function ConfigureIntegrationScreen({id, onBack}: {id: string; onBack: () => void}) {
  const {integrations, connect} = useAdmin();
  const integration = integrations.find(i => i.id === id);
  const [key, setKey] = useState('');
  const [secret, setSecret] = useState('');
  const [account, setAccount] = useState<'Primary account' | 'Training account'>('Primary account');
  const [provider, setProvider] = useState('Mailgun');
  const [sender, setSender] = useState('E-learn');
  const [sms, setSms] = useState('Not set');
  const [done, setDone] = useState(false);
  const email = id === 'sms';
  const test = () => { connect(id); haptic.success(); setDone(true); };
  return <View style={adminStyles.screen}>
    <TitleBar title={integration?.name ?? 'Integration'} onBack={onBack} />
    {done ? <View style={{flex: 1, justifyContent: 'center', padding: 36, alignItems: 'center'}}><View style={{width: 140, height: 140, borderRadius: 70, borderWidth: 22, borderColor: colors.successSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 30}}><Icon name="check" size={40} color={colors.success} /></View><Text style={adminStyles.section}>{integration?.name} is connected</Text><Text style={{color: colors.muted, textAlign: 'center', marginVertical: 16}}>Configuration saved in this preview. Live verification requires the integration API.</Text><BottomButton label="Done" onPress={onBack} /></View> : <>
    <ScrollView contentContainerStyle={adminStyles.content} keyboardShouldPersistTaps="handled">
      {email ? <Select label="Provider" value={provider} options={['Mailgun', 'SendGrid']} onChange={setProvider} /> : <Select label="Account" value={account} options={['Primary account', 'Training account'] as const} onChange={setAccount} />}
      <Field label="API key" value={key} onChangeText={setKey} placeholder="Paste key" autoCapitalize="none" autoCorrect={false} secureTextEntry />
      {email ? <><Field label="Sender name" value={sender} onChangeText={setSender} /><Select label="SMS provider" value={sms} options={['Not set', 'Twilio', 'Termii']} onChange={setSms} /></> : <Field label="API secret" value={secret} onChangeText={setSecret} placeholder="Paste secret" autoCapitalize="none" autoCorrect={false} secureTextEntry />}
    </ScrollView>
    <BottomButton label="Test and enable" disabled={!key.trim() || (email ? !sender.trim() : !secret.trim())} onPress={test} />
    </>}
  </View>;
}

export function SupportScreen({onBack, onOpen}: {onBack: () => void; onOpen: (id: string) => void}) {
  const {tickets} = useAdmin();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'Open' | 'Solved' | 'All'>('Open');
  const q = query.trim().toLowerCase();
  const shown = tickets.filter(t => (filter === 'All' || t.open === (filter === 'Open')) && (!q || t.title.toLowerCase().includes(q) || t.who.toLowerCase().includes(q)));
  return <View style={adminStyles.screen}>
    <TitleBar title="Support" onBack={onBack} />
    <View style={styles.tools}><SearchBox value={query} onChangeText={setQuery} placeholder="Search tickets" /><Chips items={['Open', 'Solved', 'All'] as const} active={filter} onSelect={setFilter} /></View>
    <ScrollView contentContainerStyle={adminStyles.content} keyboardShouldPersistTaps="handled">
      {shown.map((t, i) => <Rise key={t.id} delay={i * 50}><Row icon="message" title={t.title} detail={t.who} badge={{label: t.open ? 'Open' : 'Solved', tone: t.open ? 'gold' : 'green'}} onPress={() => onOpen(t.id)} /></Rise>)}
      {!shown.length && <EmptyState icon="message" title={filter === 'Open' ? 'No open tickets' : 'No tickets found'} message={filter === 'Open' ? 'Everyone has an answer. Nice work.' : 'Try another search.'} />}
    </ScrollView>
  </View>;
}

export function TicketScreen({id, onBack}: {id: string; onBack: () => void}) {
  const {tickets, reply, solve} = useAdmin();
  const ticket = tickets.find(t => t.id === id);
  const [text, setText] = useState('');
  const scroll = useRef<ScrollViewInstance>(null);
  if (!ticket) return <View style={adminStyles.screen}><TitleBar title="Ticket" onBack={onBack} /><EmptyState icon="message" title="Ticket not found" message="It may have been closed." /></View>;
  const send = () => { if (!text.trim()) return; haptic.tap(); reply(ticket.id, text.trim()); setText(''); setTimeout(() => scroll.current?.scrollToEnd(), 60); };
  const markSolved = () => { if (text.trim()) send(); haptic.success(); solve(ticket.id); onBack(); };
  return <KeyboardAvoidingView style={adminStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <TitleBar title={ticket.title} onBack={onBack} />
    <ScrollView ref={scroll} contentContainerStyle={[adminStyles.content, styles.thread]} onContentSizeChange={() => scroll.current?.scrollToEnd()}>
      {ticket.messages.map((m, i) => <Rise key={i} style={[styles.bubble, m.me ? styles.mine : styles.theirs]}><Text style={[styles.bubbleText, font, m.me && styles.mineText]}>{m.text}</Text></Rise>)}
    </ScrollView>
    {ticket.open && <>
      <View style={styles.composer}><TextInput value={text} onChangeText={setText} placeholder="Write a reply" placeholderTextColor={colors.muted} style={[styles.reply, font]} multiline /></View>
      <ButtonPair left={{label: 'Reply', disabled: !text.trim(), onPress: send}} right={{label: 'Mark solved', onPress: markSolved}} />
    </>}
  </KeyboardAvoidingView>;
}

export function AnnouncementScreen({onBack, cohort}: {onBack: () => void; cohort?: string}) {
  const [audience, setAudience] = useState(cohort || 'All users');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [when, setWhen] = useState<'Now' | 'Tomorrow 9 AM' | 'Next Monday 9 AM'>('Now');
  const publish = () => Alert.alert('Publish announcement?', `${audience} will get “${title.trim()}” ${when === 'Now' ? 'now' : when}.`, [
    {text: 'Cancel', style: 'cancel'},
    {text: 'Publish', onPress: () => { haptic.success(); onBack(); }},
  ]);
  return <View style={adminStyles.screen}>
    <TitleBar title="Platform announcement" onBack={onBack} />
    <ScrollView contentContainerStyle={adminStyles.content} keyboardShouldPersistTaps="handled">
      <Select label="Audience" value={audience} options={['All users', 'Students', 'Instructors', ...(cohort ? [cohort] : [])]} onChange={setAudience} />
      <Field label="Title" value={title} onChangeText={setTitle} placeholder="Scheduled maintenance" />
      <Field label="Message" value={message} onChangeText={setMessage} placeholder="Write your announcement" multiline />
      <Select label="Send" value={when} options={['Now', 'Tomorrow 9 AM', 'Next Monday 9 AM'] as const} onChange={setWhen} />
    </ScrollView>
    <BottomButton label="Publish announcement" disabled={!title.trim() || !message.trim()} onPress={publish} />
  </View>;
}

export function PrivacyScreen({onBack}: {onBack: () => void}) {
  const {privacy, completePrivacy} = useAdmin();
  const [filter, setFilter] = useState<'Open' | 'Done'>('Open');
  const [picked, setPicked] = useState<string>();
  const shown = privacy.filter(r => r.open === (filter === 'Open'));
  const request = privacy.find(r => r.id === picked);
  const review = () => {
    if (!request) return;
    const deleting = request.kind === 'Delete account';
    Alert.alert(request.kind, `${request.who}, ${request.due}.\n${deleting ? 'Their account and data will be removed for good.' : 'We will email them a copy of their data.'}`, [
      {text: 'Cancel', style: 'cancel'},
      {text: deleting ? 'Delete account' : 'Send export', style: deleting ? 'destructive' : 'default', onPress: () => { haptic.success(); completePrivacy(request.id); setPicked(undefined); }},
    ]);
  };
  return <View style={adminStyles.screen}>
    <TitleBar title="Privacy requests" onBack={onBack} />
    <View style={styles.tools}><Chips items={['Open', 'Done'] as const} active={filter} onSelect={f => { setFilter(f); setPicked(undefined); }} /></View>
    <ScrollView contentContainerStyle={adminStyles.content}>
      {shown.map((r, i) => <Rise key={r.id} delay={i * 50}><Row icon={picked === r.id ? 'check' : 'lock'} title={r.kind} detail={`${r.who}, ${r.due}`} badge={{label: r.open ? 'Open' : 'Done', tone: r.open ? 'gold' : 'green'}} onPress={r.open ? () => { haptic.select(); setPicked(r.id); } : undefined} /></Rise>)}
      {!shown.length && <EmptyState icon="lock" title={filter === 'Open' ? 'No open requests' : 'Nothing done yet'} message="Data exports and deletions show up here." />}
    </ScrollView>
    {filter === 'Open' && <BottomButton label={request ? 'Review request' : 'Pick a request'} disabled={!request} onPress={review} />}
  </View>;
}

const styles = StyleSheet.create({
  tools: {paddingHorizontal: spacing.screen},
  info: {borderRadius: radius.field, backgroundColor: colors.blue50, padding: 14, marginVertical: 8},
  infoText: {fontSize: type.caption, color: colors.blue900, fontWeight: '700'},
  thread: {paddingTop: 8, gap: 12, flexGrow: 1},
  bubble: {maxWidth: '82%', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11},
  theirs: {alignSelf: 'flex-start', backgroundColor: colors.bubble},
  mine: {alignSelf: 'flex-end', backgroundColor: colors.bubbleMe},
  bubbleText: {fontSize: type.caption, color: colors.ink, lineHeight: 19},
  mineText: {color: colors.onAccent},
  composer: {paddingHorizontal: spacing.screen},
  reply: {minHeight: 46, maxHeight: 120, borderRadius: 23, borderWidth: 1, borderColor: colors.sandLine, backgroundColor: colors.white, paddingHorizontal: 16, paddingTop: 13, paddingBottom: 13, fontSize: type.small, color: colors.ink},
});
