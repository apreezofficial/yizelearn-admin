import React, {useState} from 'react';
import {Alert, FlatList, ScrollView, StyleSheet, Text, View} from 'react-native';
import {adminStyles, Avatar, Badge, ButtonPair, Checkbox, Chips, Fab, Field, Row, SearchBox, Select, TabHeader} from '../components/Admin';
import {TabBarSpacer} from '../components/Catalog';
import {BottomButton, TitleBar} from '../components/Layout';
import {Rise} from '../components/Motion';
import {Sheet} from '../components/Sheet';
import {EmptyState} from '../components/States';
import {initials, roles, roleTone, type Role} from '../data/admin';
import {useAdmin} from '../data/store';
import {haptic} from '../theme/system';
import {colors, fonts, spacing, type} from '../theme/tokens';

const font = {fontFamily: fonts.family};
const filters = ['All', 'Students', 'Instructors', 'Admins'] as const;
type Filter = (typeof filters)[number];
const filterRole: Record<Filter, Role[] | undefined> = {All: undefined, Students: ['Student'], Instructors: ['Instructor'], Admins: ['Admin', 'Manager']};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function UsersScreen({onBell, onOpen, onSelect, onInvite}: {onBell: () => void; onOpen: (id: string) => void; onSelect: (id: string) => void; onInvite: () => void}) {
  const {users} = useAdmin();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const q = query.trim().toLowerCase();
  const shown = users.filter(u => (!filterRole[filter] || filterRole[filter]!.includes(u.role)) && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  return <View style={adminStyles.screen}>
    <TabHeader title="Users" onBell={onBell} />
    <View style={styles.tools}>
      <SearchBox value={query} onChangeText={setQuery} placeholder="Search users" />
      <Chips items={filters} active={filter} onSelect={setFilter} />
    </View>
    <FlatList data={shown} keyExtractor={u => u.id} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
      renderItem={({item, index}) => <Rise delay={index * 50}><Row initials={initials(item.name)} title={item.name} detail={item.suspended ? 'Suspended' : item.email} badge={{label: item.role, tone: item.suspended ? 'red' : roleTone[item.role]}}
        onPress={() => onOpen(item.id)} onLongPress={() => { haptic.tap(); onSelect(item.id); }} /></Rise>}
      ListEmptyComponent={<EmptyState icon="search" title="No users found" message="Try another name or email." actionLabel="Clear search" onAction={() => { setQuery(''); setFilter('All'); }} />}
      ListFooterComponent={<><Text style={[styles.hint, font]}>Long-press a user to select several</Text><TabBarSpacer /></>} />
    <Fab onPress={onInvite} label="Invite user" overTabs />
  </View>;
}

export function UserDetailScreen({id, onBack}: {id: string; onBack: () => void}) {
  const {users, setRole, setSuspended} = useAdmin();
  const user = users.find(u => u.id === id);
  const [roleOpen, setRoleOpen] = useState(false);
  if (!user) return <View style={adminStyles.screen}><TitleBar title="User" onBack={onBack} /><EmptyState icon="user" title="User not found" message="They may have been removed." actionLabel="Back to users" onAction={onBack} /></View>;
  const suspend = () => Alert.alert(user.suspended ? `Restore ${user.name}?` : `Suspend ${user.name}?`, user.suspended ? 'They can log in again straight away.' : 'They will be logged out and cannot log in until restored.', [
    {text: 'Cancel', style: 'cancel'},
    {text: user.suspended ? 'Restore' : 'Suspend', style: user.suspended ? 'default' : 'destructive', onPress: () => { haptic.warning(); setSuspended([user.id], !user.suspended); }},
  ]);
  // Everyone signs in with an email code, so there is no password to reset; ending sessions is the equivalent. The auth API does this once connected.
  const signOutAll = () => Alert.alert('Sign out of all devices?', `${user.name} will need a new email code to sign in.`, [{text: 'Cancel', style: 'cancel'}, {text: 'Sign out', onPress: () => { haptic.success(); Alert.alert('Done', `${user.name} was signed out everywhere.`); }}]);
  return <View style={adminStyles.screen}>
    <TitleBar title="User" onBack={onBack} />
    <ScrollView contentContainerStyle={adminStyles.content}>
      <Rise style={styles.profile}>
        <Avatar initials={initials(user.name)} size={72} />
        <Text style={[styles.name, font]}>{user.name}</Text>
        <Text style={[styles.sub, font]}>{user.role}, {user.lastSeen}</Text>
        {user.suspended && <View style={styles.badgeGap}><Badge label="Suspended" tone="red" /></View>}
      </Rise>
      <Rise delay={80}>
        <Fact label="Email" value={user.email} />
        <Fact label="Courses" value={String(user.courses)} />
        <Fact label="Joined" value={user.joined} />
      </Rise>
      <Rise delay={160} style={styles.actions}>
        <Row icon="role" title="Change role" chevron onPress={() => setRoleOpen(true)} />
        <Row icon="lock" title="Sign out of all devices" chevron onPress={signOutAll} />
        <Row icon={user.suspended ? 'refresh' : 'close'} title={user.suspended ? 'Restore account' : 'Suspend account'} chevron onPress={suspend} />
      </Rise>
    </ScrollView>
    <RoleSheet visible={roleOpen} current={user.role} onClose={() => setRoleOpen(false)} onPick={r => { setRole([user.id], r); haptic.success(); setRoleOpen(false); }} />
  </View>;
}

function Fact({label, value}: {label: string; value: string}) {
  return <View style={styles.fact}><Text style={[styles.factLabel, font]}>{label}</Text><Text style={[styles.factValue, font]}>{value}</Text></View>;
}

function RoleSheet({visible, current, onClose, onPick, title = 'Change role'}: {visible: boolean; current?: Role; onClose: () => void; onPick: (r: Role) => void; title?: string}) {
  return <Sheet visible={visible} onClose={onClose}>
    <Text style={[styles.sheetTitle, font]}>{title}</Text>
    {roles.map(r => <Row key={r} icon="user" title={r} badge={r === current ? {label: 'Current', tone: 'blue'} : undefined} onPress={() => onPick(r)} />)}
  </Sheet>;
}

export function BulkSelectScreen({initial, onBack}: {initial: string; onBack: () => void}) {
  const {users, setRole, setSuspended} = useAdmin();
  const [picked, setPicked] = useState<string[]>([initial]);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const all = picked.length === users.length;
  const toggle = (id: string) => { haptic.select(); setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id])); };
  const done = (msg: string) => { haptic.success(); setActionsOpen(false); setRoleOpen(false); Alert.alert('Done', msg); onBack(); };
  return <View style={adminStyles.screen}>
    <TitleBar title={`${picked.length} selected`} onBack={onBack} />
    <ScrollView contentContainerStyle={adminStyles.content}>
      {users.map(u => {
        const on = picked.includes(u.id);
        return <Row key={u.id} left={<Checkbox checked={on} />} initials={initials(u.name)} title={u.name} detail={u.role} chevron onPress={() => toggle(u.id)} />;
      })}
    </ScrollView>
    <ButtonPair left={{label: all ? 'Clear all' : 'Select all', onPress: () => setPicked(all ? [] : users.map(u => u.id))}} right={{label: 'Actions', disabled: !picked.length, onPress: () => setActionsOpen(true)}} />
    <Sheet visible={actionsOpen} onClose={() => setActionsOpen(false)}>
      <Text style={[styles.sheetTitle, font]}>{picked.length} {picked.length === 1 ? 'user' : 'users'}</Text>
      <Row icon="role" title="Change role" chevron onPress={() => { setActionsOpen(false); setTimeout(() => setRoleOpen(true), 300); }} />
      <Row icon="mail" title="Send email" detail="Opens your announcement draft" chevron onPress={() => done('Email queued for the selected users.')} />
      <Row icon="close" title="Suspend accounts" danger onPress={() => { haptic.warning(); setSuspended(picked, true); done(`${picked.length} accounts suspended.`); }} />
    </Sheet>
    <RoleSheet visible={roleOpen} title="New role" onClose={() => setRoleOpen(false)} onPick={r => { setRole(picked, r); done(`${picked.length} users are now ${r}.`); }} />
  </View>;
}

export function InviteScreen({onBack}: {onBack: () => void}) {
  const {invite} = useAdmin();
  const [email, setEmail] = useState('');
  const [role, setRoleValue] = useState<Role>('Student');
  const [note, setNote] = useState('');
  const valid = EMAIL.test(email.trim());
  // Invite emails are sent by the admin API once connected; the user is added to the list now.
  const send = () => { invite(email.trim(), role); haptic.success(); Alert.alert('Invite sent', `${email.trim()} was invited as ${role}.`); onBack(); };
  return <View style={adminStyles.screen}>
    <TitleBar title="Invite user" onBack={onBack} />
    <ScrollView contentContainerStyle={[adminStyles.content, styles.form]} keyboardShouldPersistTaps="handled">
      <Field label="Email address" value={email} onChangeText={setEmail} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" autoFocus />
      <Select label="Role" value={role} options={roles} onChange={setRoleValue} />
      <Field label="Message (optional)" value={note} onChangeText={setNote} placeholder="Add a short note" multiline />
    </ScrollView>
    <BottomButton label="Send invite" disabled={!valid} onPress={send} />
  </View>;
}

const styles = StyleSheet.create({
  tools: {paddingHorizontal: spacing.screen},
  list: {paddingHorizontal: spacing.screen, paddingBottom: 28, flexGrow: 1},
  hint: {fontSize: type.caption, color: colors.muted, textAlign: 'center', marginTop: 18},
  profile: {alignItems: 'center', paddingVertical: 12},
  name: {fontSize: type.heading, color: colors.ink, fontWeight: '800', marginTop: 12},
  sub: {fontSize: type.caption, color: colors.muted, marginTop: 4},
  badgeGap: {marginTop: 8},
  fact: {flexDirection: 'row', justifyContent: 'space-between', minHeight: 44, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.line},
  factLabel: {fontSize: type.caption, color: colors.muted},
  factValue: {fontSize: type.caption, color: colors.ink, fontWeight: '700'},
  actions: {marginTop: 24},
  sheetTitle: {fontSize: type.heading, color: colors.ink, fontWeight: '800', marginVertical: 10},
  form: {paddingTop: 8},
});
