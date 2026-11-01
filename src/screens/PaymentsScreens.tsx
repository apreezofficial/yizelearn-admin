import React, {useState} from 'react';
import {Alert, FlatList, ScrollView, StyleSheet, Text, View} from 'react-native';
import {adminStyles, ButtonPair, Chips, Fab, Row, SearchBox, TabHeader} from '../components/Admin';
import {TabBarSpacer} from '../components/Catalog';
import {TitleBar} from '../components/Layout';
import {Rise} from '../components/Motion';
import {Sheet} from '../components/Sheet';
import {EmptyState} from '../components/States';
import {formatNaira} from '../data/catalog';
import {initials, type Payment} from '../data/admin';
import {useAdmin} from '../data/store';
import {haptic} from '../theme/system';
import {colors, fonts, radius, spacing, type} from '../theme/tokens';

const font = {fontFamily: fonts.family};
const tabs = ['Transactions', 'Promo codes', 'Receipts'] as const;
type Tab = (typeof tabs)[number];

export function PaymentsScreen({onBell, onPromos}: {onBell: () => void; onPromos: () => void}) {
  const {payments, refund} = useAdmin();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('Transactions');
  const [refunding, setRefunding] = useState<Payment>();
  const q = query.trim().toLowerCase();
  const list = payments.filter(p => (tab !== 'Receipts' || p.status === 'Paid') && (!q || p.name.toLowerCase().includes(q) || p.detail.toLowerCase().includes(q)));
  const select = (t: Tab) => { if (t === 'Promo codes') onPromos(); else setTab(t); };
  const open = (p: Payment) => {
    if (tab === 'Receipts') { Alert.alert(`Receipt for ${p.name}`, `${formatNaira(p.amount)}, ${p.detail}, ${p.date}`); return; }
    if (p.status === 'Refunded') { Alert.alert('Already refunded', `${p.name} got ${formatNaira(p.amount)} back.`); return; }
    setRefunding(p);
  };
  // Refunds go through the payment provider once it is connected; the list updates now.
  const confirm = () => { if (!refunding) return; haptic.warning(); refund(refunding.id); setRefunding(undefined); };
  return <View style={adminStyles.screen}>
    <TabHeader title="Payments" onBell={onBell} />
    <View style={styles.tools}>
      <SearchBox value={query} onChangeText={setQuery} placeholder="Search payments" />
      <Chips items={tabs} active={tab} onSelect={select} />
    </View>
    <FlatList data={list} keyExtractor={p => p.id} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
      renderItem={({item, index}) => <Rise delay={index * 50}><Row initials={initials(item.name)} title={item.name} detail={item.detail}
        value={item.status === 'Paid' ? formatNaira(item.amount) : undefined}
        badge={item.status === 'Paid' ? undefined : {label: item.status, tone: item.status === 'Pending' ? 'gold' : 'grey'}} onPress={() => open(item)} /></Rise>}
      ListEmptyComponent={<EmptyState icon="card" title="No payments found" message="Try another name or course." />}
      ListFooterComponent={<TabBarSpacer />} />
    <Sheet visible={!!refunding} onClose={() => setRefunding(undefined)}>
      {refunding && <View style={styles.refund}>
        <Text style={[styles.refundTitle, font]}>Refund {formatNaira(refunding.amount)}</Text>
        <View style={styles.refundCard}>
          <Text style={[styles.refundName, font]}>{refunding.name}</Text>
          <Text style={[styles.refundDetail, font]}>{refunding.detail}, paid {refunding.date}</Text>
        </View>
        <Text style={[styles.refundNote, font]}>The learner loses access to the course once the refund goes through.</Text>
      </View>}
      <ButtonPair left={{label: 'Cancel', onPress: () => setRefunding(undefined)}} right={{label: 'Refund', danger: true, onPress: confirm}} />
    </Sheet>
  </View>;
}

export function PromoCodesScreen({onBack}: {onBack: () => void}) {
  const {promos, addPromo} = useAdmin();
  const [tab, setTab] = useState<'Active' | 'Expired'>('Active');
  const shown = promos.filter(p => p.active === (tab === 'Active'));
  const add = () => {
    const save = (value?: string) => { const code = value?.trim().toUpperCase(); if (!code) return; haptic.success(); addPromo(code); setTab('Active'); };
    if (Alert.prompt) Alert.prompt('New promo code', 'Letters and numbers, like SPRING15', save);
    else save(`PROMO${promos.length + 1}`);
  };
  return <View style={adminStyles.screen}>
    <TitleBar title="Promo codes" onBack={onBack} />
    <View style={styles.tools}><Chips items={['Active', 'Expired'] as const} active={tab} onSelect={setTab} /></View>
    <ScrollView contentContainerStyle={adminStyles.content}>
      {shown.map((p, i) => <Rise key={p.code} delay={i * 50}><Row icon="card" title={p.code} detail={p.detail} badge={{label: p.active ? 'Active' : 'Expired', tone: p.active ? 'green' : 'grey'}} /></Rise>)}
      {!shown.length && <EmptyState icon="tag" title={`No ${tab.toLowerCase()} codes`} message="Codes you create show up here." />}
    </ScrollView>
    <Fab onPress={add} label="New promo code" />
  </View>;
}

const styles = StyleSheet.create({
  tools: {paddingHorizontal: spacing.screen},
  list: {paddingHorizontal: spacing.screen, paddingBottom: 28, flexGrow: 1},
  refund: {paddingTop: 6, paddingBottom: 18},
  refundTitle: {fontSize: type.heading, color: colors.ink, fontWeight: '800', marginBottom: 12},
  refundCard: {borderRadius: radius.field, backgroundColor: colors.sand, padding: 14},
  refundName: {fontSize: type.small, color: colors.ink, fontWeight: '700'},
  refundDetail: {fontSize: 12, color: colors.muted, marginTop: 4},
  refundNote: {fontSize: type.caption, color: colors.muted, marginTop: 14, lineHeight: 19},
});
